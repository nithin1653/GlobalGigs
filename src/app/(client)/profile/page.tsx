
'use client'

import UserProfileForm from '@/components/user-profile-form';

export default function ClientProfilePage() {
    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight font-headline">Account Settings</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Update your name and profile photo.
                </p>
            </div>

            <UserProfileForm />
        </div>
    );
}
