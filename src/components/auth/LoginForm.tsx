
// src/components/auth/LoginForm.tsx
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { login, type LoginFormState } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Logging in..." : "Login"}
    </Button>
  );
}

export function LoginForm() {
  const initialState: LoginFormState = { message: null, errors: {}, success: false };
  const [state, dispatch] = useActionState(login, initialState);

  useEffect(() => {
    if (state?.success) {
      // Redirect on success. Using replace to avoid login page in browser history.
      window.location.replace('/dashboard');
    }
  }, [state]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Login</CardTitle>
        <CardDescription>Enter your credentials to access your CalisthenicsAI dashboard.</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              aria-describedby="email-error"
            />
            {state?.errors?.email && (
              <p id="email-error" className="text-sm text-destructive">
                {state.errors.email.join(", ")}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              aria-describedby="password-error"
            />
            {state?.errors?.password && (
              <p id="password-error" className="text-sm text-destructive">
                {state.errors.password.join(", ")}
              </p>
            )}
          </div>

          {state?.errors?.form && (
             <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Login Error</AlertTitle>
              <AlertDescription>
                {state.errors.form.join(", ")}
              </AlertDescription>
            </Alert>
          )}
           {state?.message && !state.errors?.form && (
            <Alert>
              <AlertTitle>Message</AlertTitle>
              <AlertDescription>
                {state.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton />
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
