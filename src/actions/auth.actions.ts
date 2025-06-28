
// src/actions/auth.actions.ts
"use server";

import { z } from "zod";
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase'; // Actual Firebase auth instance
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { createUserProfile } from '@/lib/firestore.service';

// Helper function to safely get cookies
async function safeCookies() {
  try {
    return cookies();
  } catch (error) {
    console.error('Cookies not available in current context:', error);
    throw new Error('Authentication requires a valid request context');
  }
}

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
    const cookieStore = await safeCookies();
    cookieStore.set('firebaseAuthToken', idToken, { 
      httpOnly: true, 
      path: '/', 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 60 * 60 * 2 // 2 hours
    });
  } catch (error: any) {
    console.error("Login Error (Raw):", error); 
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
        case 'auth/configuration-not-found':
          errorMessage = "Firebase configuration error (auth/configuration-not-found). Please ensure your API key and project settings in .env are correct and that Firebase Authentication is properly set up in your Firebase project console.";
          break;
        default:
          errorMessage = (error as any).message || `An unexpected error occurred during login (code: ${error.code}). Check server logs.`;
      }
    } else if (error.message) {
        errorMessage = error.message;
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
};

export async function signup(prevState: SignupFormState | undefined, formData: FormData): Promise<SignupFormState> {
  const validatedFields = SignupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid fields. Signup failed.",
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    const userId = userCredential.user.uid;

    // Create a corresponding user profile in Firestore
    await createUserProfile(userId, { email });
    
    const cookieStore = await safeCookies();
    cookieStore.set('firebaseAuthToken', idToken, { 
        httpOnly: true, 
        path: '/', 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 2 // 2 hours
    });
  } catch (error: any) {
    console.error("Signup Error (Raw):", error); 
    let specificErrorMessage = "An unexpected error occurred during signup. Please check server logs for details.";

    if (error instanceof Error) {
        const firebaseError = error as any; // Cast to access potential 'code' property
        if (typeof firebaseError.code === 'string') {
            switch (firebaseError.code) {
                case 'auth/email-already-in-use':
                    specificErrorMessage = "This email address is already in use.";
                    break;
                case 'auth/weak-password':
                    specificErrorMessage = "The password is too weak. Please choose a stronger password.";
                    break;
                case 'auth/invalid-email':
                    specificErrorMessage = "Invalid email format.";
                    break;
                case 'auth/operation-not-allowed':
                    specificErrorMessage = "Email/Password sign-up is not enabled for this project. Please enable it in your Firebase console's Authentication > Sign-in method settings.";
                    break;
                case 'auth/configuration-not-found':
                    specificErrorMessage = "Firebase configuration error (auth/configuration-not-found). Please ensure your API key and project settings in .env are correct and that Firebase Authentication is properly set up in your Firebase project console.";
                    break;
                default:
                    specificErrorMessage = firebaseError.message || `An unexpected error occurred (code: ${firebaseError.code}). Check server logs.`;
                    break;
            }
        } else {
            specificErrorMessage = error.message || "An unexpected error occurred. Check server logs.";
        }
    } else if (typeof error === 'string') {
        specificErrorMessage = error;
    }
    
     return {
      errors: { form: [specificErrorMessage] },
      message: "Signup failed.",
    };
  }
  
  redirect('/dashboard');
}

export async function logout() {
  try {
    // While Firebase client-side signOut is often used, it doesn't invalidate server-side session cookies
    // A robust implementation would involve an API route to revoke the token with Firebase Admin SDK.
    // For this app's scope, simply deleting the cookie is sufficient.
    await signOut(auth); // Clear client-side state
    const cookieStore = await safeCookies();
    cookieStore.delete('firebaseAuthToken');
  } catch (error) {
    console.error("Logout failed (Raw):", error);
    // Even if client signOut fails, we must delete the cookie
    try {
      const cookieStore = await safeCookies();
      cookieStore.delete('firebaseAuthToken');
    } catch (cookieError) {
      console.error("Failed to delete cookie:", cookieError);
    }
  }
  redirect('/login');
}
