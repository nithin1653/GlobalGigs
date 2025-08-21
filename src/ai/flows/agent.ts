
// src/ai/flows/agent.ts
'use server';

import { getFreelancers } from '@/lib/firebase';
import type { Freelancer } from '@/lib/mock-data';

export type QuizState = {
  category?: string;
  skills?: string;
  experience?: string;
};

function formatOptions(options: string[]): string {
    return `[OPTIONS: ${options.join(', ')}]`;
}

function presentFreelancers(freelancers: Freelancer[]): string {
    if (freelancers.length === 0) {
        return "I couldn't find any freelancers matching your criteria. Please try again with different keywords. [COMPLETE]";
    }
    const freelancerList = freelancers.map(f => `- **${f.name}** (${f.role}) - Skills: ${f.skills.join(', ')} - Rating: ${f.averageRating?.toFixed(1) || 'N/A'}`).join('\n');
    return `Here are some top freelancers I found for you:\n${freelancerList}\n\nWould you like to start over? [COMPLETE]`;
}

export async function chatWithAgentFlow(state: QuizState, userInput?: string) {
  // 1. Start of conversation or if no category is set
  if (!state.category) {
    // If userInput is one of the valid categories, we set it.
    const categories = ["Web & App Development", "Design & Creative", "Writing & Translation", "Marketing & Sales"];
    if (userInput && categories.includes(userInput)) {
        const newState = { ...state, category: userInput };
        return {
            state: newState,
            text: `Great! What specific skills are you looking for within ${userInput}? (e.g., React, Node.js, Swift)`
        };
    }
    // Otherwise, we ask the question.
    return {
      state,
      text: `Hello! Let's find the right talent for you.\n\nFirst, which category are you interested in? ${formatOptions(categories)}`
    };
  }

  // 2. Category is set, but skills are not.
  if (!state.skills) {
    if (!userInput) { // Should not happen if UI sends input
        return { state, text: `What specific skills are you looking for within ${state.category}?` };
    }
    const newState = { ...state, skills: userInput };
    const experienceLevels = ["Entry-Level", "Intermediate", "Expert"];
    return {
      state: newState,
      text: `Got it. You need skills like **${userInput}**. \n\nWhat experience level is required? ${formatOptions(experienceLevels)}`
    };
  }

  // 3. Category and skills are set, but experience is not.
  if (!state.experience) {
     if (!userInput) { // Should not happen if UI sends input
        const experienceLevels = ["Entry-Level", "Intermediate", "Expert"];
        return { state, text: `What experience level is required? ${formatOptions(experienceLevels)}` };
    }
    const newState = { ...state, experience: userInput };
     const query = `${newState.experience} ${newState.category} ${newState.skills}`;
    
    const allFreelancers = await getFreelancers();
    const queryTerms = query.toLowerCase().split(' ');

    const filtered = allFreelancers
        .filter(f => {
        const profileText = [
            f.name,
            f.role,
            ...f.skills,
            f.category,
            f.bio,
            ...(f.experience?.map(e => `${e.role} ${e.description}`) || [])
        ]
            .join(' ')
            .toLowerCase();

        return queryTerms.every(term => profileText.includes(term));
        })
        .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        .slice(0, 3);
    
    return {
      state: newState,
      text: `Awesome! Searching for **${userInput}** freelancers...\n\n${presentFreelancers(filtered)}`
    };
  }
  
  // This case is for restarting the conversation after completion.
  if (userInput) {
      const emptyState: QuizState = {};
      const categories = ["Web & App Development", "Design & Creative", "Writing & Translation", "Marketing & Sales"];
       return {
        state: emptyState,
        text: `Let's start over! Which category are you interested in? ${formatOptions(categories)}`
      };
  }

  // Default fallback, should ideally not be reached
  return {
      state,
      text: "I'm not sure how to proceed. Would you like to start over?"
  }
}
