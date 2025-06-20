// src/actions/workout.actions.ts
"use server";

import { z } from "zod";
import type { WorkoutLog, WorkoutSummary, ExerciseLog, WorkoutType, DifficultyRating, FatigueLevel, SorenessLevel, Mood, EnergyLevel } from "@/lib/types";
import { summarizeWorkout, type SummarizeWorkoutInput } from "@/ai/flows/summarize-workout-flow";
import { getCurrentUser } from '@/lib/auth';
import { addWorkoutLog } from '@/lib/firestore.service';

const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required."),
  sets: z.coerce.number().min(1, "Sets must be at least 1."),
  reps: z.string().min(1, "Reps or duration is required."),
});

const workoutLogServerSchema = z.object({
  workoutType: z.enum(["Push", "Pull", "Core & Legs", "Mobility/Recovery"]),
  exercises: z.array(exerciseSchema).min(1),
  difficultyRating: z.coerce.number().min(1).max(10),
  fatigue: z.enum(["Low", "Medium", "High"]),
  soreness: z.enum(["None", "Mild", "Moderate", "Severe"]),
  mood: z.enum(["Great", "Good", "Okay", "Bad", "Awful"]),
  energy: z.enum(["High", "Medium", "Low"]),
  notes: z.string().optional(),
});


export type LogWorkoutFormState = {
  errors?: {
    workoutType?: string[];
    exercises?: string[] | { name?: string[], sets?: string[], reps?: string[] }[]; // More specific error typing
    difficultyRating?: string[];
    fatigue?: string[];
    soreness?: string[];
    mood?: string[];
    energy?: string[];
    notes?: string[];
    form?: string[]; // General form errors
  };
  message?: string | null;
  summary?: WorkoutSummary | null;
};


export async function logWorkoutAction(prevState: LogWorkoutFormState | undefined, formData: FormData): Promise<LogWorkoutFormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { 
      errors: { form: ["You must be logged in to log a workout."] }, 
      message: "Authentication failed." 
    };
  }

  const rawExercises: any[] = [];
  formData.forEach((value, key) => {
    const match = key.match(/^exercises\[(\d+)\]\.(name|sets|reps)$/);
    if (match) {
      const index = parseInt(match[1], 10);
      const field = match[2];
      if (!rawExercises[index]) rawExercises[index] = {};
      rawExercises[index][field] = value;
    }
  });

  const rawFormData = {
    workoutType: formData.get('workoutType'),
    exercises: rawExercises.filter(ex => ex), // Filter out empty slots if any
    difficultyRating: formData.get('difficultyRating'),
    fatigue: formData.get('fatigue'),
    soreness: formData.get('soreness'),
    mood: formData.get('mood'),
    energy: formData.get('energy'),
    notes: formData.get('notes') || undefined,
  };
  
  const validatedFields = workoutLogServerSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as any, // Cast for simplicity
      message: "Invalid workout data. Please check your entries.",
      summary: null,
    };
  }

  const workoutData = validatedFields.data;

  const newLog: Omit<WorkoutLog, 'id' | 'userId'> = {
    date: new Date(), // This will be replaced by server timestamp in the service
    workoutType: workoutData.workoutType as WorkoutType,
    exercises: workoutData.exercises.map(ex => ({
        name: ex.name,
        sets: Number(ex.sets),
        reps: ex.reps,
    })),
    difficultyRating: workoutData.difficultyRating as DifficultyRating,
    fatigue: workoutData.fatigue as FatigueLevel,
    soreness: workoutData.soreness as SorenessLevel,
    mood: workoutData.mood as Mood,
    energy: workoutData.energy as EnergyLevel,
    notes: workoutData.notes,
  };

  try {
    // Save to Firestore
    await addWorkoutLog(user.uid, newLog);

    // Prepare input for AI summarization
    const aiInput: SummarizeWorkoutInput = {
      workoutLog: `
        Type: ${newLog.workoutType}
        Exercises: ${newLog.exercises.map(ex => `${ex.name} - ${ex.sets} sets of ${ex.reps}`).join(', ')}
        Difficulty: ${newLog.difficultyRating}/10
        Fatigue: ${newLog.fatigue}, Soreness: ${newLog.soreness}, Mood: ${newLog.mood}, Energy: ${newLog.energy}
      `,
      userNotes: newLog.notes,
      // previousSummary: "Fetch previous summary if available" // Optional
    };

    const aiSummary = await summarizeWorkout(aiInput);

    return {
      message: "Workout logged successfully and summarized by AI!",
      summary: aiSummary,
    };

  } catch (error: any) {
    console.error("Error logging workout or getting AI summary:", error);
    const errorMessage = error.message || "An unexpected error occurred. Please try again.";
    return {
      errors: { form: [errorMessage] },
      message: "Failed to log workout.",
      summary: null,
    };
  }
}
