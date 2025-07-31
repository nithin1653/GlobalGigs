
'use client'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OldProfilePage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/profile/edit');
    }, [router]);

    return null;
}