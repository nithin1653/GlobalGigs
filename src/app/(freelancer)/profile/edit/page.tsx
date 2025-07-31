import ProfileForm from '@/components/profile-form';

export default function EditProfilePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Manage Your Profile</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Keep your information up to date to attract the best clients.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
