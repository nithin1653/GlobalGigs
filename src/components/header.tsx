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
import { LayoutGrid, MessageSquare, Briefcase, LogIn, LogOut, Settings, UserPlus } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth.js';
import { useToast } from '@/hooks/use-toast';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const isAuthPage = pathname === '/login';
  
  // Don't render header on login page
  if (isAuthPage) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.'});
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block font-headline text-lg">GlobalGigs</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/discover"
            className={cn("transition-colors hover:text-foreground/80", pathname === "/discover" ? "text-foreground" : "text-foreground/60")}
          >
            Discover
          </Link>
          <Link
            href="/messages"
            className={cn("transition-colors hover:text-foreground/80", pathname === "/messages" ? "text-foreground" : "text-foreground/60")}
          >
            Messages
          </Link>
          <Link
            href="/profile/edit"
            className={cn("transition-colors hover:text-foreground/80", pathname === "/profile/edit" ? "text-foreground" : "text-foreground/60")}
          >
            My Profile
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Button>Post a Job</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || "https://placehold.co/32x32.png"} alt="User Avatar" />
                  <AvatarFallback>{user?.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
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
                  <DropdownMenuItem>
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
        </div>
      </div>
    </header>
  );
}
