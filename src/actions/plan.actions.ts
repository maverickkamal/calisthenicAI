// src/actions/plan.actions.ts
"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { addTrainingPlan } from '@/lib/firestore.service';

const dayScheduleSchema = z.object({
  day: z.string().min(1, 'Day name cannot be empty.'),
  exercises: z.string().min(1, 'Exercises cannot be empty.'),
});

const planSchema = z.object({
  planName: z.string().min(1, 'Plan name is required.'),
  schedule: z.array(dayScheduleSchema).min(1, 'You must have at least one day in your schedule.'),
});

export type SavePlanFormState = {
  errors?: {
    planName?: string[];
    schedule?: string[] | { day?: string[], exercises?: string[] }[];
    form?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function savePlanAction(prevState: SavePlanFormState, formData: FormData): Promise<SavePlanFormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { 
      errors: { form: ["You must be logged in to save a plan."] }, 
      message: "Authentication failed.",
      success: false,
    };
  }

  const rawSchedule: any[] = [];
  formData.forEach((value, key) => {
    const match = key.match(/^schedule\[(\d+)\]\.(day|exercises)$/);
    if (match) {
      const index = parseInt(match[1], 10);
      const field = match[2];
      if (!rawSchedule[index]) rawSchedule[index] = {};
      rawSchedule[index][field] = value;
    }
  });

  const rawFormData = {
    planName: formData.get('planName'),
    schedule: rawSchedule.filter(item => item),
  };

  const validatedFields = planSchema.safeParse(rawFormData);
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as any,
      message: 'Invalid plan data. Please check your entries.',
      success: false,
    };
  }
  
  try {
    await addTrainingPlan(user.uid, validatedFields.data);
    revalidatePath('/training-plan'); // Invalidate cache to show the new plan immediately
    return {
      message: 'Your new training plan has been saved successfully!',
      success: true,
    };
  } catch (error: any) {
    console.error('Error saving training plan:', error);
    return {
      errors: { form: [error.message || 'An unexpected error occurred.'] },
      message: 'Failed to save training plan.',
      success: false,
    };
  }
}
