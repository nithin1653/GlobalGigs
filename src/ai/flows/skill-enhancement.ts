// src/ai/flows/skill-enhancement.ts
'use server';

/**
 * @fileOverview An AI-powered tool that suggests skills a freelancer might have based on their past experiences and listed skills.
 *
 * - enhanceSkills - A function that handles the skill enhancement process.
 * - EnhanceSkillsInput - The input type for the enhanceSkills function.
 * - EnhanceSkillsOutput - The return type for the enhanceSkills function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceSkillsInputSchema = z.object({
  pastExperiences: z
    .string()
    .describe('Description of the freelancer\'s past work experiences.'),
  existingSkills: z
    .string()
    .describe('Comma-separated list of the freelancer\'s current skills.'),
});
export type EnhanceSkillsInput = z.infer<typeof EnhanceSkillsInputSchema>;

const EnhanceSkillsOutputSchema = z.object({
  suggestedSkills: z
    .string()
    .describe(
      'Comma-separated list of suggested skills based on past experiences and existing skills.'
    ),
});
export type EnhanceSkillsOutput = z.infer<typeof EnhanceSkillsOutputSchema>;

export async function enhanceSkills(input: EnhanceSkillsInput): Promise<EnhanceSkillsOutput> {
  return enhanceSkillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceSkillsPrompt',
  input: {schema: EnhanceSkillsInputSchema},
  output: {schema: EnhanceSkillsOutputSchema},
  prompt: `You are an AI assistant helping freelancers improve their profiles.

  Based on their past experiences and existing skills, suggest additional skills they might have.
  Provide the skills as a comma-separated list.

  Past Experiences: {{{pastExperiences}}}
  Existing Skills: {{{existingSkills}}}
  `,
});

const enhanceSkillsFlow = ai.defineFlow(
  {
    name: 'enhanceSkillsFlow',
    inputSchema: EnhanceSkillsInputSchema,
    outputSchema: EnhanceSkillsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
