'use server';

import { getTrainingSuggestions, type TrainingSuggestionsInput } from '@/ai/flows/memory-context-flow';

export async function getAITrainingSuggestions(input: TrainingSuggestionsInput) {
  try {
    const result = await getTrainingSuggestions(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting AI training suggestions:", error);
    return { success: false, error: "Could not generate training suggestions. Try again later." };
  }
}