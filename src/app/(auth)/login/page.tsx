// src/app/(auth)/login/page.tsx
import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from 'next';
import Link from "next/link";
import { HelpCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'Login - CalisthenicsAI',
  description: 'Login to your CalisthenicsAI account.',
};

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <div className="mt-4 text-center">
         <Button variant="link" asChild className="text-xs text-muted-foreground">
            <Link href="/debug">
               <HelpCircle className="mr-2 h-4 w-4" />
               Having trouble? Click here to debug the database connection.
            </Link>
         </Button>
      </div>
    </>
  );
}
