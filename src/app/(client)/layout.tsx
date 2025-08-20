
'use client';
import Header from '@/components/header';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
        <Header />
        <main className="flex-1">{children}</main>
    </>
    );
}
