// src/components/auth/SignupForm.tsx
"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserProfileAction, type SignupFormState } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

function SubmitButton({ isAuthenticating }: { isAuthenticating: boolean }) {
  const { pending } = useFormStatus();
  const isLoading = pending || isAuthenticating;
  
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? "Creating account..." : "Create Account"}
    </Button>
  );
}

export function SignupForm() {
  const initialState: SignupFormState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(createUserProfileAction, initialState);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!email || !password || !confirmPassword) {
      setClientError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setClientError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setClientError("Password must be at least 6 characters.");
      return;
    }

    setIsAuthenticating(true);
    setClientError(null);

    try {
      // Client-side Firebase authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // Create user profile via server action
      const serverFormData = new FormData();
      serverFormData.append('email', email);
      serverFormData.append('userId', userCredential.user.uid);
      
      // Call server action to create user profile
      dispatch(serverFormData);

      // Set session cookie via API route
      const sessionResponse = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to establish session');
      }

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      setIsAuthenticating(false);
      console.error("Client-side signup error:", error);
      
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
          case 'auth/operation-not-allowed':
            errorMessage = "Email/Password sign-up is not enabled for this project.";
            break;
          case 'auth/configuration-not-found':
            errorMessage = "Firebase configuration error. Please ensure your API key and project settings are correct.";
            break;
          default:
            errorMessage = error.message || `An unexpected error occurred (code: ${error.code}).`;
        }
      }
      setClientError(errorMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Create Account</CardTitle>
        <CardDescription>Join CalisthenicsAI and start tracking your progress.</CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="•••••••• (min. 6 characters)"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          {(clientError || state?.errors?.form) && (
             <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Signup Error</AlertTitle>
              <AlertDescription>
                {clientError || state?.errors?.form?.join(", ")}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton isAuthenticating={isAuthenticating} />
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/login">Login</Link>
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}