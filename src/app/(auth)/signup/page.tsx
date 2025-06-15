// src/app/(auth)/signup/page.tsx
import { SignupForm } from "@/components/auth/SignupForm";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - CalisthenicsAI',
  description: 'Create your CalisthenicsAI account.',
};

export default function SignupPage() {
  return <SignupForm />;
}
