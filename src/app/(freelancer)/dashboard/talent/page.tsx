
'use client'
import PortfolioForm from '@/components/portfolio-form';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function TalentShowcasePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <div className="container mx-auto max-w-4xl px-0 sm:px-4 py-4 sm:py-12">
            <Skeleton className="h-12 w-1/2 mb-2" />
            <Skeleton className="h-6 w-3/4 mb-8" />
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-0 sm:px-4 py-4 sm:py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Talent Showcase</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Add and manage your portfolio items to showcase your best work to potential clients.
        </p>
      </div>
      {user ? (
        <PortfolioForm userId={user.uid} />
      ) : (
        <p>Please log in to manage your portfolio.</p>
      )}
    </div>
  );
}
