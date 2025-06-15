// src/ai/flows/personalize-training-plan-flow.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized training plans.
 *
 * - generateTrainingPlan - A function that generates a personalized training plan.
 * - TrainingPlanInput - The input type for the generateTrainingPlan function.
 * - TrainingPlanOutput - The return type for the generateTrainingPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrainingPlanInputSchema = z.object({
  pushExercises: z.array(z.string()).describe('List of push exercises.'),
  pullExercises: z.array(z.string()).describe('List of pull exercises.'),
  coreLegsExercises: z.array(z.string()).describe('List of core and legs exercises.'),
  mobilityRecoveryExercises: z.array(z.string()).describe('List of mobility and recovery exercises.'),
  userPreferences: z.string().describe('User preferences for the training plan, including frequency, intensity, and goals.'),
  workoutHistory: z.string().describe('History of previous workouts, including exercises, sets, reps, and notes.'),
});

export type TrainingPlanInput = z.infer<typeof TrainingPlanInputSchema>;

const TrainingPlanOutputSchema = z.object({
  trainingPlan: z.string().describe('A personalized training plan for the user.'),
  warnings: z.array(z.string()).describe('Warnings about undertrained muscle groups.'),
});

export type TrainingPlanOutput = z.infer<typeof TrainingPlanOutputSchema>;

export async function generateTrainingPlan(input: TrainingPlanInput): Promise<TrainingPlanOutput> {
  return generateTrainingPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'trainingPlanPrompt',
  input: {schema: TrainingPlanInputSchema},
  output: {schema: TrainingPlanOutputSchema},
  prompt: `You are an expert calisthenics coach. You will generate a personalized training plan for the user, taking into account their preferences, workout history, and available exercises.

The training plan should be split across Push, Pull, Core & Legs, and Mobility/Recovery days.

Push Exercises: {{pushExercises}}
Pull Exercises: {{pullExercises}}
Core & Legs Exercises: {{coreLegsExercises}}
Mobility/Recovery Exercises: {{mobilityRecoveryExercises}}

User Preferences: {{userPreferences}}
Workout History: {{workoutHistory}}

You should also warn the user if certain muscle groups are being undertrained.

{{output}}`,
});

const generateTrainingPlanFlow = ai.defineFlow(
  {
    name: 'generateTrainingPlanFlow',
    inputSchema: TrainingPlanInputSchema,
    outputSchema: TrainingPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
