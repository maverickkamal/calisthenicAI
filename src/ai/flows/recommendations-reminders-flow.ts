'use server';
/**
 * @fileOverview Provides AI-driven recommendations for adapting calisthenics routines and suggesting exercise progressions.
 *
 * - getRecommendations - A function that generates personalized workout recommendations based on user data.
 * - RecommendationsInput - The input type for the getRecommendations function.
 * - RecommendationsOutput - The return type for the getRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendationsInputSchema = z.object({
  sorenessLevel: z.string().describe('The level of soreness the user is experiencing (e.g., none, mild, moderate, severe).'),
  skippedDays: z.number().describe('The number of workout days the user has skipped in the past week.'),
  sleepQuality: z.string().describe('The quality of the user’s sleep (e.g., excellent, good, poor, very poor).'),
  currentExercises: z.array(z.string()).describe('The list of exercises the user is currently performing.'),
  performanceHistory: z.string().describe('A summary of the user’s performance history, including notable achievements and areas for improvement.'),
  trainingGoals: z.string().describe('The user’s current training goals (e.g., increase push-up reps, learn pistol squats).'),
  userNotes: z.string().describe('Any additional notes from the user about their current condition or preferences.'),
});
export type RecommendationsInput = z.infer<typeof RecommendationsInputSchema>;

const RecommendationsOutputSchema = z.object({
  routineAdaptation: z.string().describe('Recommendations for adapting the user’s current routine based on soreness, skipped days, and sleep quality.'),
  exerciseProgressions: z.array(z.string()).describe('Suggested exercise progressions based on the user’s current exercises and training goals.'),
  additionalTips: z.string().describe('Any additional tips or reminders for the user to optimize their training.'),
});
export type RecommendationsOutput = z.infer<typeof RecommendationsOutputSchema>;

export async function getRecommendations(input: RecommendationsInput): Promise<RecommendationsOutput> {
  return recommendationsRemindersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendationsRemindersPrompt',
  input: {schema: RecommendationsInputSchema},
  output: {schema: RecommendationsOutputSchema},
  prompt: `You are an AI fitness coach specializing in calisthenics. Based on the user’s input, provide personalized recommendations for adapting their routine and suggesting exercise progressions.

  Soreness Level: {{{sorenessLevel}}}
  Skipped Days: {{{skippedDays}}}
  Sleep Quality: {{{sleepQuality}}}
  Current Exercises: {{#each currentExercises}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Performance History: {{{performanceHistory}}}
  Training Goals: {{{trainingGoals}}}
  User Notes: {{{userNotes}}}

  Consider the following when providing recommendations:
  - Adjust routine intensity based on soreness and sleep quality.
  - Suggest alternative exercises or rest days if the user has skipped workout days.
  - Recommend exercise progressions that align with the user’s training goals and performance history.
  - Provide specific and actionable advice.

  Output the routineAdaptation, exerciseProgressions and additionalTips fields with respect to the above information.
  `,
});

const recommendationsRemindersFlow = ai.defineFlow(
  {
    name: 'recommendationsRemindersFlow',
    inputSchema: RecommendationsInputSchema,
    outputSchema: RecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
