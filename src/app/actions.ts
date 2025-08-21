
'use server';

import { enhanceSkills, EnhanceSkillsInput } from '@/ai/flows/skill-enhancement';
import { chatWithAgent as chatWithAgentFlow } from '@/ai/flows/agent';
import { updateFreelancerProfile, updateUserProfile, getUserProfile, createGigProposal, acceptGig, getParticipantData, sendMessage, updateGigProposalStatus, updateGig, addReviewForFreelancer } from '@/lib/firebase';
import type { Freelancer, PortfolioItem, GigProposal, Gig, Review } from '@/lib/mock-data';
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


export async function handleUpdateProfile(uid: string, data: Partial<Omit<Freelancer, 'id' | 'experience' | 'portfolio' | 'category' | 'avatarUrl'>>) {
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
        
        const messageText = proposal.updatedGigId 
            ? `Gig Update Proposal: ${proposal.title}`
            : `Gig Proposal: ${proposal.title}`;

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
        if (proposal.updatedGigId) {
            // This is an update to an existing gig
            await updateGig(proposal.updatedGigId, {
                title: proposal.title,
                description: proposal.description,
                price: proposal.price,
                status: 'In Progress',
            });
        } else {
            // This is a new gig
            const client = await getParticipantData(proposal.clientId);
            const freelancer = await getParticipantData(proposal.freelancerId);
            
            await acceptGig({
                ...proposal,
                status: 'In Progress',
                client,
                freelancer,
                createdAt: new Date().toISOString(),
            });
        }
        
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

export async function handleUpdateGig(gig: Gig, data: {title: string, description: string, price: number}) {
    try {
        // If price is unchanged, just update the gig
        if (gig.price === data.price) {
            await updateGig(gig.id, {
                title: data.title,
                description: data.description,
            });
            revalidatePath('/dashboard/tasks');
            return { success: true, gig: {...gig, ...data} };
        }

        // If price has changed, create a new proposal for the update
        const proposal: Omit<GigProposal, 'id' | 'status' | 'createdAt'> = {
            conversationId: gig.conversationId!,
            freelancerId: gig.freelancerId,
            clientId: gig.clientId,
            title: data.title,
            description: data.description,
            price: data.price,
            updatedGigId: gig.id,
        }

        const proposalResult = await sendGigProposal(proposal);
        if (!proposalResult.success) {
            throw new Error(proposalResult.error);
        }

        // Mark the original gig as pending update
        await updateGig(gig.id, { status: 'Pending Update' });

        const updatedGig = { ...gig, status: 'Pending Update' };

        revalidatePath('/dashboard/tasks');
        return { success: true, gig: updatedGig };

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: errorMessage };
    }
}

export async function handleCompleteGig(gig: Gig) {
    try {
        await updateGig(gig.id, { status: 'Completed' });

        if (gig.conversationId) {
            await sendMessage(gig.conversationId, {
                senderId: gig.freelancerId,
                text: `I have marked the gig "${gig.title}" as complete. Please let me know if you have any feedback!`,
                timestamp: new Date(),
            });
        }
        
        revalidatePath('/dashboard/tasks');
        const updatedGig = { ...gig, status: 'Completed' };
        return { success: true, gig: updatedGig };

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: errorMessage };
    }
}

export async function handleCancelGig(gig: Gig) {
    try {
        await updateGig(gig.id, { status: 'Cancelled' });

        if (gig.conversationId) {
            await sendMessage(gig.conversationId, {
                senderId: gig.freelancerId,
                text: `I have cancelled the gig: "${gig.title}". Please let me know if you have any questions.`,
                timestamp: new Date(),
            });
        }
        
        revalidatePath('/dashboard/tasks');
        const updatedGig = { ...gig, status: 'Cancelled' };
        return { success: true, gig: updatedGig };

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: errorMessage };
    }
}

export async function handleSubmitReview(reviewData: Omit<Review, 'id' | 'createdAt'>) {
    try {
        await addReviewForFreelancer(reviewData);
        revalidatePath(`/freelancers/${reviewData.freelancerId}`);
        revalidatePath('/discover');
        return { success: true };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: errorMessage };
    }
}

// Chatbot Action
export async function chatWithAgent(history: any[], newMessage: string) {
    try {
      const result = await chatWithAgentFlow(history, newMessage);
      return result;
    } catch (error) {
      console.error("[Action Error] Chatbot failed", error);
      return 'Sorry, I encountered an error. Please try again.';
    }
}
