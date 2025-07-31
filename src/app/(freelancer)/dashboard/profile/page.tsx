
'use client'

import { useState } from 'react';
import ProfileForm from '@/components/profile-form';
import UserProfileForm from '@/components/user-profile-form';
import { Button } from '@/components/ui/button';
import { User, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';


type ActiveTab = 'public' | 'account';

export default function EditProfilePage() {
    const { userProfile, loading } = useAuth();
    const [activeTab, setActiveTab] = useState<ActiveTab>('public');

    const isFreelancer = userProfile?.role === 'freelancer';

    // If a client is viewing, default to account settings.
    // This check is mostly for robustness, as clients shouldn't reach this page.
    if (!isFreelancer && activeTab === 'public') {
        setActiveTab('account');
    }

    if (loading) {
        return (
            <div className="container mx-auto max-w-5xl px-4 py-12">
                 <div className="mb-8">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="mt-2 h-6 w-1/2" />
                </div>
                 <div className="flex border-b mb-8">
                     <Skeleton className="h-10 w-36" />
                 </div>
                 <div>
                    <Skeleton className="h-96 w-full" />
                 </div>
            </div>
        )
    }


    return (
        <div className="container mx-auto max-w-5xl px-4 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight font-headline">Edit Your Profile</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Keep your professional and account information up-to-date.
                </p>
            </div>

            <div className="flex border-b mb-8">
                {isFreelancer && (
                    <TabButton
                        icon={<Briefcase />}
                        label="Public Profile"
                        isActive={activeTab === 'public'}
                        onClick={() => setActiveTab('public')}
                    />
                )}
                <TabButton
                    icon={<User />}
                    label="Account Settings"
                    isActive={activeTab === 'account'}
                    onClick={() => setActiveTab('account')}
                />
            </div>

            <div>
                {activeTab === 'public' && isFreelancer && <ProfileForm />}
                {activeTab === 'account' && <UserProfileForm />}
            </div>
        </div>
    );
}

function TabButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px",
                isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
            )}
        >
            {icon}
            {label}
        </button>
    )
}
