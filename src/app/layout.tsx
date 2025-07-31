
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import { AuthProvider } from '@/hooks/use-auth.js';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'GlobalGigs',
  description: 'A talent marketplace for freelancers and clients.',
  icons: {
    icon: '/favicon.svg',
  },
};

function RootLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <div className="relative flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
      <Toaster />
    </AuthProvider>
  )
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-body antialiased">
        <Suspense fallback={<div>Loading...</div>}>
          <RootLayoutContent>{children}</RootLayoutContent>
        </Suspense>
      </body>
    </html>
  );
}
