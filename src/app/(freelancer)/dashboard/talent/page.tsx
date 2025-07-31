
import PortfolioForm from '@/components/portfolio-form';

export default function TalentShowcasePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Talent Showcase</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Add and manage your portfolio items to showcase your best work to potential clients.
        </p>
      </div>
      <PortfolioForm />
    </div>
  );
}
