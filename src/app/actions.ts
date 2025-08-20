
'use server';

import { enhanceSkills, EnhanceSkillsInput } from '@/ai/flows/skill-enhancement';
import { updateFreelancerProfile, updateUserProfile, getUserProfile, createGigProposal, acceptGig, getParticipantData, sendMessage, updateGigProposalStatus } from '@/lib/firebase';
import type { Freelancer, PortfolioItem, GigProposal } from '@/lib/mock-data';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';
import { revalidatePath } from 'next/cache';

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
    const buffer = Buffer.from(fileBuffer);
    
    const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: 'globalgigs_portfolio',
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        ).end(buffer);
    });

    return { success: true, url: (result as any).secure_url };
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

        // Update the core user profile in Realtime DB
        await updateUserProfile(uid, { name: data.name, avatarUrl: data.avatarUrl });
        
        // If the user is a freelancer, also update their public freelancer profile
        if (userProfile?.role === 'freelancer') {
           await updateFreelancerProfile(uid, { name: data.name, avatarUrl: data.avatarUrl });
        }
        
        // Note: The Firebase Auth user (for header display) will not update immediately.
        // This requires the Admin SDK, which has been removed due to environment issues.
        // The user will see the updated info in the header after signing out and back in.
        
        return { success: true };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: errorMessage };
    }
}

interface PortfolioFormData extends Omit<PortfolioItem, 'technologiesUsed' | 'imageUrls'> {
    technologiesUsed?: string;
    imageUrls: string[];
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

export async function sendGigProposal(proposal: Omit<GigProposal, 'id' | 'status' | 'createdAt'>) {
    try {
        const proposalId = await createGigProposal(proposal);
        
        const messageText = `Gig Proposal: ${proposal.title}`;
        await sendMessage(proposal.conversationId, {
            senderId: proposal.freelancerId,
            text: messageText,
            timestamp: new Date(),
            metadata: {
                type: 'gig-proposal',
                proposalId: proposalId,
            }
        });
        
        return { success: true, proposalId };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: errorMessage };
    }
}

export async function acceptGigProposal(proposal: GigProposal) {
    try {
        const client = await getParticipantData(proposal.clientId);
        const freelancer = await getParticipantData(proposal.freelancerId);
        
        await acceptGig({
            ...proposal,
            status: 'In Progress',
            client,
            freelancer,
            createdAt: new Date().toISOString(),
        });
        
        await updateGigProposalStatus(proposal.id, 'Accepted');
        
        const messageText = `Accepted Gig: ${proposal.title}`;
        await sendMessage(proposal.conversationId, {
            senderId: proposal.clientId,
            text: messageText,
            timestamp: new Date(),
             metadata: {
                type: 'gig-acceptance',
                proposalId: proposal.id,
            }
        });
        
        revalidatePath('/dashboard/tasks');
        
        return { success: true };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: errorMessage };
    }
}
