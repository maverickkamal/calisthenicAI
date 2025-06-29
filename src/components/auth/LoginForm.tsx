// src/components/auth/LoginForm.tsx
"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateLogin, type LoginFormState } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

function SubmitButton({ isAuthenticating }: { isAuthenticating: boolean }) {
  const { pending } = useFormStatus();
  const isLoading = pending || isAuthenticating;
  
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? "Logging in..." : "Login"}
    </Button>
  );
}

export function LoginForm() {
  const initialState: LoginFormState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(validateLogin, initialState);
  const [isPending, startTransition] = useTransition();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setClientError("Email and password are required.");
      return;
    }

    setIsAuthenticating(true);
    setClientError(null);

    try {
      // Client-side Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
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

      // Validate login data with server action
      const serverFormData = new FormData();
      serverFormData.append('email', email);
      serverFormData.append('userId', userCredential.user.uid);
      
      // Call server action for validation
      startTransition(() => {
        dispatch(serverFormData);
      });

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      setIsAuthenticating(false);
      console.error("Client-side login error:", error);
      
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
          case 'auth/too-many-requests':
            errorMessage = "Too many failed attempts. Please try again later.";
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
        <CardTitle className="font-headline text-2xl">Login</CardTitle>
        <CardDescription>Enter your credentials to access your CalisthenicsAI dashboard.</CardDescription>
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
              placeholder="••••••••"
              required
            />
          </div>

          {(clientError || state?.errors?.form) && (
             <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Login Error</AlertTitle>
              <AlertDescription>
                {clientError || state?.errors?.form?.join(", ")}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton isAuthenticating={isAuthenticating || isPending} />
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/signup">Sign up</Link>
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}