// src/actions/auth.actions.ts
"use server";

import { z } from "zod";
import { createUserProfile } from '@/lib/firestore.service';

const TokenSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  userId: z.string().min(1, { message: "Invalid user ID." }),
});

const SignupTokenSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  userId: z.string().min(1, { message: "Invalid user ID." }),
});

export type LoginFormState = {
  errors?: {
    form?: string[];
  };
  message?: string | null;
};

export async function validateLogin(prevState: LoginFormState | undefined, formData: FormData): Promise<LoginFormState> {
  const validatedFields = TokenSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid user data.",
    };
  }

  return {
    message: "Login validation successful.",
  };
}

export type SignupFormState = {
  errors?: {
    form?: string[];
  };
  message?: string | null;
};

export async function createUserProfileAction(prevState: SignupFormState | undefined, formData: FormData): Promise<SignupFormState> {
  const validatedFields = SignupTokenSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid user data.",
    };
  }

  const { email, userId } = validatedFields.data;

  try {
    // Create a corresponding user profile in Firestore
    await createUserProfile(userId, { email });

    return {
      message: "User profile created successfully.",
    };
  } catch (error: any) {
    console.error("Signup Error (Server):", error);
    return {
      errors: { form: ["Failed to create user profile. Please try again."] },
      message: "User profile creation failed.",
    };
  }
}
