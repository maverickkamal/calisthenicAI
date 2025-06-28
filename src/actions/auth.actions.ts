// src/actions/auth.actions.ts
"use server";

import { z } from "zod";
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createUserProfile } from '@/lib/firestore.service';

const TokenSchema = z.object({
  idToken: z.string().min(1, { message: "Invalid authentication token." }),
  email: z.string().email({ message: "Invalid email address." }),
  userId: z.string().min(1, { message: "Invalid user ID." }),
});

const SignupTokenSchema = z.object({
  idToken: z.string().min(1, { message: "Invalid authentication token." }),
  email: z.string().email({ message: "Invalid email address." }),
  userId: z.string().min(1, { message: "Invalid user ID." }),
});

export type LoginFormState = {
  errors?: {
    idToken?: string[];
    form?: string[];
  };
  message?: string | null;
};

export async function login(prevState: LoginFormState | undefined, formData: FormData): Promise<LoginFormState> {
  const validatedFields = TokenSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid authentication data. Login failed.",
    };
  }

  const { idToken } = validatedFields.data;

  try {
    const cookieStore = cookies();
    cookieStore.set('firebaseAuthToken', idToken, { 
      httpOnly: true, 
      path: '/', 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 60 * 60 * 2 // 2 hours
    });
  } catch (error: any) {
    console.error("Login Error (Server):", error);
    return {
      errors: { form: ["Failed to establish session. Please try again."] },
      message: "Login failed.",
    };
  }
  
  redirect('/dashboard');
}

export type SignupFormState = {
  errors?: {
    idToken?: string[];
    form?: string[];
  };
  message?: string | null;
};

export async function signup(prevState: SignupFormState | undefined, formData: FormData): Promise<SignupFormState> {
  const validatedFields = SignupTokenSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid authentication data. Signup failed.",
    };
  }

  const { idToken, email, userId } = validatedFields.data;

  try {
    // Create a corresponding user profile in Firestore
    await createUserProfile(userId, { email });
    
    const cookieStore = cookies();
    cookieStore.set('firebaseAuthToken', idToken, { 
        httpOnly: true, 
        path: '/', 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 2 // 2 hours
    });
  } catch (error: any) {
    console.error("Signup Error (Server):", error);
    return {
      errors: { form: ["Failed to create user profile or establish session. Please try again."] },
      message: "Signup failed.",
    };
  }
  
  redirect('/dashboard');
}

export async function logout() {
  try {
    const cookieStore = cookies();
    cookieStore.delete('firebaseAuthToken');
  } catch (error) {
    console.error("Logout failed (Server):", error);
  }
  redirect('/login');
}