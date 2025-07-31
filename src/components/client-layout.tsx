'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/hooks/use-auth.js';
import Header from '@/components/header';
import { Toaster } from '@/components/ui/toaster';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <AuthProvider>
      <div className="relative flex min-h-screen w-full flex-col">
        {!isDashboard && <Header />}
        <main className="flex-1">{children}</main>
      </div>
      <Toaster />
    </AuthProvider>
  );
}
