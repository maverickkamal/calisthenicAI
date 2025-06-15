import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  // Middleware will redirect authenticated users to /dashboard
  // and unauthenticated users from / to /login.
  // This page can serve as a public landing page if needed in the future,
  // or a simple entry point if middleware handles all root redirects.
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary mb-6 font-headline">Welcome to CalisthenicsAI</h1>
        <p className="text-xl text-foreground mb-8">
          Your personal AI fitness assistant to track, analyze, and elevate your calisthenics journey.
        </p>
        <div className="space-x-4">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
