// src/ai/flows/memory-context-flow.ts
'use server';

/**
 * @fileOverview AI flow to provide context-aware training suggestions based on user history.
 *
 * This flow analyzes user's logged workouts, notes, and patterns to offer personalized recommendations.
 * - `getTrainingSuggestions`: The main function to get training suggestions.
 * - `TrainingSuggestionsInput`: Input type for training suggestions, including current workout log and user notes.
 * - `TrainingSuggestionsOutput`: Output type containing AI's personalized suggestions for the user's training plan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the training suggestions flow.
const TrainingSuggestionsInputSchema = z.object({
  workoutLog: z.string().describe('A summary of the current workout session, including exercises, sets, reps, and difficulty.'),
  userNotes: z.string().describe('Any notes from the user about their workout, fatigue, soreness, or mood.'),
  previousWeekSummary: z.string().optional().describe('A summary of the previous week of workouts.'),
});
export type TrainingSuggestionsInput = z.infer<typeof TrainingSuggestionsInputSchema>;

// Define the output schema for the training suggestions flow.
const TrainingSuggestionsOutputSchema = z.object({
  suggestions: z.string().describe('AI-driven suggestions for the user\u2019s training plan, considering progress, context, patterns, and preferences.'),
});
export type TrainingSuggestionsOutput = z.infer<typeof TrainingSuggestionsOutputSchema>;

// Main function to get training suggestions.
export async function getTrainingSuggestions(input: TrainingSuggestionsInput): Promise<TrainingSuggestionsOutput> {
  return trainingSuggestionsFlow(input);
}

// Define the prompt for generating training suggestions.
const trainingSuggestionsPrompt = ai.definePrompt({
  name: 'trainingSuggestionsPrompt',
  input: {schema: TrainingSuggestionsInputSchema},
  output: {schema: TrainingSuggestionsOutputSchema},
  prompt: `You are an AI calisthenics coach with a memory of the user's workout history.

  Analyze the user's current workout log, notes, and previous week's summary to provide personalized training suggestions.
  Consider the user's progress, context, patterns, and preferences to suggest improvements to their training plan.
  Prioritize preventing overtraining and suggest exercise progressions where appropriate.

  Current Workout Log: {{{workoutLog}}}
  User Notes: {{{userNotes}}}
  Previous Week Summary: {{{previousWeekSummary}}}

  Suggestions:`,
});

// Define the Genkit flow for generating training suggestions.
const trainingSuggestionsFlow = ai.defineFlow(
  {
    name: 'trainingSuggestionsFlow',
    inputSchema: TrainingSuggestionsInputSchema,
    outputSchema: TrainingSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await trainingSuggestionsPrompt(input);
    return output!;
  }
);
