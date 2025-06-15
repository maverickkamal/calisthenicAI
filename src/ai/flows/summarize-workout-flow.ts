'use server';
/**
 * @fileOverview Summarizes the user's workout, updates trends, and displays progress in graphs.
 *
 * - summarizeWorkout - A function that handles the workout summary process.
 * - SummarizeWorkoutInput - The input type for the summarizeWorkout function.
 * - SummarizeWorkoutOutput - The return type for the summarizeWorkout function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeWorkoutInputSchema = z.object({
  workoutLog: z
    .string()
    .describe(
      'A detailed log of the workout session, including exercises, sets, reps, difficulty rating, fatigue, soreness, mood, and energy levels.'
    ),
  userNotes: z
    .string()
    .optional()
    .describe('Any additional notes or observations from the user about the workout.'),
  previousSummary: z
    .string()
    .optional()
    .describe('The summary of the previous workout session.'),
});
export type SummarizeWorkoutInput = z.infer<typeof SummarizeWorkoutInputSchema>;

const SummarizeWorkoutOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the workout session.'),
  trends: z.string().describe('An update on the user trends and progress.'),
  progressHighlights: z
    .string()
    .describe('Highlights of the progress made in the workout.'),
});
export type SummarizeWorkoutOutput = z.infer<typeof SummarizeWorkoutOutputSchema>;

export async function summarizeWorkout(input: SummarizeWorkoutInput): Promise<SummarizeWorkoutOutput> {
  return summarizeWorkoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeWorkoutPrompt',
  input: {schema: SummarizeWorkoutInputSchema},
  output: {schema: SummarizeWorkoutOutputSchema},
  prompt: `You are an AI fitness assistant that summarizes calisthenics workouts, updates trends, and displays progress.

  Here's the workout log:
  {{workoutLog}}

  Here are the user's notes:
  {{userNotes}}

  Previous workout summary:
  {{previousSummary}}

  Summarize the workout, update trends, and highlight progress in graphs.
  Consider the user's notes and previous summaries to provide personalized and context-aware feedback.
  The summary should be concise and motivating.
  The trends should reflect the user's progress over time.
  The progress highlights should focus on the most significant improvements.

  Output should be formatted as JSON:
  {
    "summary": "Workout summary",
    "trends": "Updated trends",
    "progressHighlights": "Progress highlights"
  }`,
});

const summarizeWorkoutFlow = ai.defineFlow(
  {
    name: 'summarizeWorkoutFlow',
    inputSchema: SummarizeWorkoutInputSchema,
    outputSchema: SummarizeWorkoutOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
