
// src/ai/flows/agent.ts
'use server';

/**
 * @fileOverview A conversational agent that guides users through a series of questions to find and suggest freelancers.
 *
 * - chatWithAgentFlow - A function that handles the conversational quiz logic.
 * - findFreelancers - A tool the agent can use to find and recommend freelancers based on collected criteria.
 */

import { ai } from '@/ai/genkit';
import { getFreelancers } from '@/lib/firebase';
import { z } from 'genkit';

const FreelancerSearchInputSchema = z.object({
  query: z
    .string()
    .describe(
      'The user\'s request, such as "web developer", "logo designer", or "react expert". This should be constructed from the quiz answers.'
    ),
});

const findFreelancers = ai.defineTool(
  {
    name: 'findFreelancers',
    description: 'Finds available freelancers based on a structured query from the quiz answers.',
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
    
    const queryTerms = query.toLowerCase().split(' ');

    const filtered = allFreelancers.filter(f => {
        const profileText = [
            f.name,
            f.role,
            ...f.skills,
            f.category,
            f.bio,
            ...(f.experience?.map(e => `${e.role} ${e.description}`) || [])
        ].join(' ').toLowerCase();

        return queryTerms.every(term => profileText.includes(term));
    })
     .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)) // Sort by rating
     .slice(0, 3); // Return top 3

    console.log(`[Agent] Found ${filtered.length} freelancers.`);

    return filtered.map(f => ({
        name: f.name,
        role: f.role,
        skills: f.skills,
        averageRating: f.averageRating
    }));
  }
);


const agentSystemPrompt = `You are a helpful assistant for GlobalGigs, a freelancer marketplace.
Your goal is to help users find the right talent by guiding them through a short quiz.
You are friendly, professional, and you ask one question at a time.

This is the quiz flow:
1. Start with a greeting and ask what category of freelancer they're looking for. Provide options: "Web & App Development", "Design & Creative", "Writing & Translation", "Marketing & Sales".
2. Based on the category, ask for specific skills. For example, for "Web & App Development", you could ask "What specific skills do you need? (e.g., React, Node.js, Swift)". This should be a free-text question.
3. Ask about the desired experience level. Provide options: "Entry-Level", "Intermediate", "Expert".
4. After the last question, you MUST use the findFreelancers tool to search for freelancers based on all the collected answers.
5. When calling the tool, combine the answers into a single query string. For example: "Expert Web & App Development React Node.js".
6. After getting the results from the tool, present the freelancers to the user in a nicely formatted list. If no freelancers are found, say so.
7. End the conversation. Do not ask any more questions.
`;


export async function chatWithAgentFlow(history: any[]) {
    const {text} = await ai.generate({
        history,
        system: agentSystemPrompt,
        tools: [findFreelancers],
        prompt: "Continue the conversation based on the history.",
    });
    return text;
}
