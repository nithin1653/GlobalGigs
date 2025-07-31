
'use server';

import { enhanceSkills, EnhanceSkillsInput } from '@/ai/flows/skill-enhancement';
import { updateFreelancerProfile, updateUserProfile, getUserProfile } from '@/lib/firebase';
import type { Freelancer, PortfolioItem } from '@/lib/mock-data';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from 'firebase-admin';
import { getAuth } from 'firebase/auth';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export async function handleEnhanceSkills(input: EnhanceSkillsInput) {
  try {
    const result = await enhanceSkills(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function uploadToCloudinary(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: 'No file provided.' };
  }

  try {
    const fileBuffer = await file.arrayBuffer();
    const mimeType = file.type;
    const encoding = 'base64';
    const base64Data = Buffer.from(fileBuffer).toString('base64');
    const fileUri = 'data:' + mimeType + ';' + encoding + ',' + base64Data;
    
    const result = await cloudinary.uploader.upload(fileUri, {
        folder: 'globalgigs_portfolio',
    });

    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during upload.';
    return { success: false, error: errorMessage };
  }
}


const updateProfileSchema = z.object({
  name: z.string(),
  role: z.string(),
  rate: z.number(),
  location: z.string(),
  bio: z.string(),
  skills: z.array(z.string()),
  experience: z.array(z.object({
    role: z.string(),
    company: z.string(),
    period: z.string(),
    description: z.string().optional(),
  })),
});


export async function handleUpdateProfile(uid: string, data: Partial<Omit<Freelancer, 'id' | 'experience' | 'portfolio' | 'availability' | 'category' | 'avatarUrl'>>) {
    try {
        await updateFreelancerProfile(uid, data);
        return { success: true };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: errorMessage };
    }
}

export async function handleUpdateUser(uid: string, data: {name: string, avatarUrl?: string}) {
    try {
        const userProfile = await getUserProfile(uid);
        await updateUserProfile(uid, data);

        if (userProfile?.role === 'freelancer') {
            const freelancerUpdateData: Partial<Freelancer> = { name: data.name };
            if (data.avatarUrl) {
                freelancerUpdateData.avatarUrl = data.avatarUrl;
            }
            await updateFreelancerProfile(uid, freelancerUpdateData);
        }
        
        return { success: true };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: errorMessage };
    }
}

interface PortfolioFormData extends Omit<PortfolioItem, 'technologiesUsed'> {
    technologiesUsed?: string;
}

export async function handleUpdatePortfolio(uid: string, portfolio: PortfolioFormData[]) {
    try {
        const portfolioWithHintsAndTech = portfolio.map((item, index) => ({
            ...item,
            id: index,
            hint: item.title.split(' ').slice(0, 2).join(' ').toLowerCase(),
            technologiesUsed: (item.technologiesUsed || '').split(',').map(tech => tech.trim()).filter(Boolean),
        }));
        await updateFreelancerProfile(uid, { portfolio: portfolioWithHintsAndTech });
        return { success: true };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: errorMessage };
    }
}
