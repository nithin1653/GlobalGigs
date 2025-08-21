
// src/ai/flows/agent.ts
'use server';

/**
 * @fileOverview A conversational agent that can answer questions about the platform and suggest freelancers.
 *
 * - chatWithAgentFlow - A function that handles the conversational logic.
 * - findFreelancers - A tool the agent can use to find and recommend freelancers.
 */

import { ai } from '@/ai/genkit';
import { getFreelancers } from '@/lib/firebase';
import { z } from 'genkit';

const FreelancerSearchInputSchema = z.object({
  query: z
    .string()
    .describe(
      'The user\'s request, such as "web developer", "logo designer", or "react expert".'
    ),
});

const findFreelancers = ai.defineTool(
  {
    name: 'findFreelancers',
    description: 'Finds available freelancers based on a query.',
    inputSchema: FreelancerSearchInputSchema,
    outputSchema: z.array(z.object({
        name: z.string(),
        role: z.string(),
        skills: z.array(z.string()),
        averageRating: z.number().optional(),
    })),
  },
  async ({ query }) => {
    console.log(`[Agent] Searching for freelancers with query: ${query}`);
    const allFreelancers = await getFreelancers();

    const filtered = allFreelancers.filter(f => 
        (f.name.toLowerCase().includes(query.toLowerCase())) ||
        (f.role.toLowerCase().includes(query.toLowerCase())) ||
        (f.skills.some(skill => skill.toLowerCase().includes(query.toLowerCase()))) ||
        (f.category.toLowerCase().includes(query.toLowerCase()))
    ).sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)) // Sort by rating
     .slice(0, 5); // Return top 5

    return filtered.map(f => ({
        name: f.name,
        role: f.role,
        skills: f.skills,
        averageRating: f.averageRating
    }));
  }
);


const agentPrompt = ai.definePrompt({
    name: 'chatbotAgentPrompt',
    system: `You are a helpful assistant for GlobalGigs, a freelancer marketplace.
    Your goal is to answer user questions about the platform and help them find the right talent.
    You are friendly, professional, and concise.

    If the user asks for a type of freelancer, use the findFreelancers tool to provide a list of top-rated experts.
    When presenting freelancers, format your response nicely. Mention their name, role, skills, and rating if available.

    For general questions about the website, answer them based on your knowledge of a typical freelance marketplace.
    Example Topics:
    - How to hire a freelancer
    - How to post a job
    - Payment protection
    - How to become a freelancer
    `,
    tools: [findFreelancers],
});


export async function chatWithAgentFlow(history: any[], newMessage: string) {
    const response = await ai.generate({
        prompt: newMessage,
        history,
        system: agentPrompt.system,
        tools: agentPrompt.tools,
    });
    return response.text;
}
