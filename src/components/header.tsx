
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
import { Briefcase, LogOut, User, LayoutDashboard, MessageSquare, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.js';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '@/components/ui/sheet';


export default function Header() {
  const router = useRouter();
  const { user, userProfile, loading, signOut } = useAuth();
  const { toast } = useToast();
  
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
  const avatarUrl = user?.photoURL || userProfile?.avatarUrl;

  const navLinks = [
      { href: "/discover", label: "Discover" },
  ];
   if (!isFreelancer && user) {
       navLinks.push({ href: "/discover/messages", label: "Messages" });
   }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block font-headline text-lg">GlobalGigs</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
          {navLinks.map(link => (
             <Link key={link.href} href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">{link.label}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
          ) : !user ? (
             <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost">
                    <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                    <Link href="/login">Sign Up</Link>
                </Button>
             </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} alt="User Avatar" />
                    <AvatarFallback>{userProfile?.name?.charAt(0) ?? user.email?.[0]?.toUpperCase() ?? <User />}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile?.name || user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isFreelancer ? (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /><span>Dashboard</span></Link>
                    </DropdownMenuItem>
                ): (
                   <DropdownMenuItem asChild>
                     <Link href="/profile"><User className="mr-2 h-4 w-4" /><span>Manage Profile</span></Link>
                   </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

           {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map(link => (
                    <SheetClose key={link.href} asChild>
                      <Link href={link.href} className="text-lg text-muted-foreground transition-colors hover:text-foreground">{link.label}</Link>
                    </SheetClose>
                  ))}
                  <DropdownMenuSeparator />
                   {!user && (
                    <>
                     <SheetClose asChild>
                      <Button asChild variant="outline">
                          <Link href="/login">Log In</Link>
                      </Button>
                      </SheetClose>
                       <SheetClose asChild>
                      <Button asChild>
                          <Link href="/login">Sign Up</Link>
                      </Button>
                       </SheetClose>
                    </>
                  )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
