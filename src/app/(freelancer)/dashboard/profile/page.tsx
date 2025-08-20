
'use client'

import { useState } from 'react';
import ProfileForm from '@/components/profile-form';
import UserProfileForm from '@/components/user-profile-form';
import { Button } from '@/components/ui/button';
import { User, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';


type ActiveTab = 'public' | 'account';

export default function EditProfilePage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('public');

    return (
        <div className="container mx-auto max-w-5xl px-0 py-4 sm:px-4 sm:py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight font-headline">Edit Your Profile</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Keep your professional and account information up-to-date.
                </p>
            </div>

            <div className="flex border-b mb-8">
                <TabButton
                    icon={<Briefcase />}
                    label="Public Profile"
                    isActive={activeTab === 'public'}
                    onClick={() => setActiveTab('public')}
                />
                <TabButton
                    icon={<User />}
                    label="Account Settings"
                    isActive={activeTab === 'account'}
                    onClick={() => setActiveTab('account')}
                />
            </div>

            <div>
                {activeTab === 'public' && <ProfileForm />}
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
