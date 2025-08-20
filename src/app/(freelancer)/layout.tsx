
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, User, Settings, LayoutDashboard, ListTodo, Gem, MessageSquare, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/profile', icon: User, label: 'My Profile' },
    { href: '/dashboard/tasks', icon: ListTodo, label: 'Active Gigs' },
    { href: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/dashboard/talent', icon: Gem, label: 'Talent Showcase' },
];

const mobileNavItems = [
     { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
     { href: '/dashboard/tasks', icon: ListTodo, label: 'Gigs' },
     { href: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
     { href: '/dashboard/profile', icon: User, label: 'Profile' },
]


export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="">GlobalGigs</span>
            </Link>
          </div>
          <ScrollArea className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    pathname === item.href && 'bg-muted text-primary'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </ScrollArea>
           <div className="mt-auto p-4 border-t">
             <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                 <Link
                  href="/dashboard/settings"
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    pathname === '/dashboard/settings' && 'bg-muted text-primary'
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
             </nav>
           </div>
        </div>
      </div>
      
      <div className="flex flex-col">
         {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 md:hidden">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="">GlobalGigs</span>
            </Link>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background overflow-auto">
            {children}
        </main>
        
        {/* Mobile Bottom Nav */}
        <footer className="md:hidden sticky bottom-0 z-10 border-t bg-muted/40 p-2">
            <nav className="grid grid-cols-4 items-center justify-items-center gap-1 text-sm font-medium">
                 {mobileNavItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg px-3 py-2 w-full text-muted-foreground transition-all hover:text-primary',
                        pathname === item.href && 'text-primary'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-xs">{item.label}</span>
                    </Link>
              ))}
            </nav>
        </footer>
      </div>
    </div>
  );
}
