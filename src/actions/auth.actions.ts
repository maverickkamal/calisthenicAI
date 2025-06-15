// src/actions/auth.actions.ts
"use server";

import { z } from "zod";
import { redirect } from 'next/navigation';
// import { auth } from '@/lib/firebase'; // Actual Firebase auth instance
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

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
    // In a real app, you'd call Firebase auth here:
    // const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // const idToken = await userCredential.user.getIdToken();
    // Set cookie with idToken (e.g., using 'cookies-next' or similar library)
    // For now, simulate success:
    console.log(`Simulating login for: ${email}`);
    // On successful login, you would set a cookie and redirect.
    // The redirect should be handled by the form component or middleware based on cookie presence.
    // This action can return a success message or specific data.
    // For demonstration, we will redirect from the server action (though client-side redirect after setting cookie is common)
  } catch (error: any) {
    // Firebase error codes can be handled here
    // e.g., error.code === 'auth/user-not-found' or 'auth/wrong-password'
    return {
      errors: { form: ["Invalid email or password."] },
      message: "Login failed. Please try again.",
    };
  }

  // If successful, redirect to dashboard.
  // This needs to be handled carefully with server actions.
  // Typically, the client component checks the state and redirects.
  // For now, let's assume the cookie is set and middleware will redirect.
  // Or, use redirect() from 'next/navigation' if cookie setup is handled here.
  // For placeholder, we'll redirect, but cookie management is key.
  // cookies().set('firebaseAuthToken', 'fake-token', { httpOnly: true, path: '/' });
  redirect('/dashboard');
  
  // This part is unreachable due to redirect, but shows what a success state might look like.
  // return { message: "Login successful!" }; 
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
    // In a real app, you'd call Firebase auth here:
    // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // const idToken = await userCredential.user.getIdToken();
    // Set cookie with idToken
    console.log(`Simulating signup for: ${email}`);
  } catch (error: any) {
    // Firebase error codes can be handled here
    // e.g., error.code === 'auth/email-already-in-use'
     return {
      errors: { form: ["Signup failed. This email might already be in use."] },
      message: "Signup failed. Please try again.",
      success: false,
    };
  }
  
  // cookies().set('firebaseAuthToken', 'fake-token', { httpOnly: true, path: '/' });
  redirect('/dashboard');
  // return { message: "Signup successful! Please login.", success: true };
}

export async function logout() {
  try {
    // In a real app, you'd call Firebase auth signOut and clear the cookie:
    // await signOut(auth);
    // cookies().delete('firebaseAuthToken');
    console.log("Simulating logout");
  } catch (error) {
    console.error("Logout failed", error);
    // Handle error appropriately
  }
  redirect('/login');
}
