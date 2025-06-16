// src/actions/auth.actions.ts
"use server";

import { z } from "zod";
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase'; // Actual Firebase auth instance
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const SignupSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export type LoginFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    form?: string[];
  };
  message?: string | null;
};

export async function login(prevState: LoginFormState | undefined, formData: FormData): Promise<LoginFormState> {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid fields. Login failed.",
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    cookies().set('firebaseAuthToken', idToken, { 
      httpOnly: true, 
      path: '/', 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
  } catch (error: any) {
    console.error("Login Error:", error); // Added detailed logging
    let errorMessage = "Login failed. Please try again.";
    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = "Invalid email or password.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled.";
          break;
        case 'auth/invalid-email':
            errorMessage = "Invalid email format.";
            break;
        default:
          errorMessage = "An unexpected error occurred during login.";
      }
    }
    return {
      errors: { form: [errorMessage] },
      message: "Login failed.",
    };
  }
  redirect('/dashboard');
}


export type SignupFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    form?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function signup(prevState: SignupFormState | undefined, formData: FormData): Promise<SignupFormState> {
  const validatedFields = SignupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid fields. Signup failed.",
      success: false,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    // Automatically log in user by setting the cookie
    cookies().set('firebaseAuthToken', idToken, { 
        httpOnly: true, 
        path: '/', 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 // 1 week
    });
  } catch (error: any) {
    console.error("Signup Error:", error); // Added detailed logging
    let errorMessage = "Signup failed. Please try again.";
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email address is already in use.";
          break;
        case 'auth/weak-password':
          errorMessage = "The password is too weak. Please choose a stronger password.";
          break;
        case 'auth/invalid-email':
            errorMessage = "Invalid email format.";
            break;
        default:
          errorMessage = "An unexpected error occurred during signup.";
      }
    }
     return {
      errors: { form: [errorMessage] },
      message: "Signup failed.",
      success: false,
    };
  }
  
  redirect('/dashboard');
}

export async function logout() {
  try {
    await signOut(auth);
    cookies().delete('firebaseAuthToken');
  } catch (error) {
    console.error("Logout failed", error);
    // Optionally, display a message to the user or handle more gracefully
  }
  redirect('/login');
}
