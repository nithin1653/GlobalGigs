'use server';

import { enhanceSkills, EnhanceSkillsInput } from '@/ai/flows/skill-enhancement';
import { z } from 'zod';

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
