
'use client';
import Link from 'next/link';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Briefcase, LogIn, LogOut, User, UserPlus, LayoutDashboard, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.js';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUserProfile } from '@/lib/firebase';
import type { UserProfile } from '@/lib/mock-data';


export default function Header() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    }
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.'});
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const isFreelancer = userProfile?.role === 'freelancer';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block font-headline text-lg">GlobalGigs</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link href="/discover" className="text-muted-foreground transition-colors hover:text-foreground">Discover</Link>
            {!isFreelancer && user && (
                 <Link href="/discover/messages" className="text-muted-foreground transition-colors hover:text-foreground">Messages</Link>
            )}
        </nav>

        <div className="ml-auto flex items-center gap-4">
            {!user && !loading && (
                 <Button asChild variant="ghost">
                    <Link href="/login">Log In</Link>
                </Button>
            )}
             {!user && !loading && (
                 <Button asChild>
                    <Link href="/login">Sign Up</Link>
                </Button>
            )}
        
          {(user || loading) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || "https://placehold.co/32x32.png"} alt="User Avatar" />
                    <AvatarFallback>{loading ? '' : user?.email?.[0]?.toUpperCase() || <User />}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {loading ? <DropdownMenuLabel>Loading...</DropdownMenuLabel> : user ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isFreelancer && (
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /><span>Dashboard</span></Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login"><LogIn className="mr-2 h-4 w-4" /><span>Log In</span></Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/login"><UserPlus className="mr-2 h-4 w-4" /><span>Sign Up</span></Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
