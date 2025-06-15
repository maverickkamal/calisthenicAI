// src/app/(auth)/login/page.tsx
import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - CalisthenicsAI',
  description: 'Login to your CalisthenicsAI account.',
};

export default function LoginPage() {
  return <LoginForm />;
}
