// src/app/(app)/journal/page.tsx
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Journal - CalisthenicsAI',
  description: 'Interact with your AI coach, log journal entries, and review contextual insights.',
};

export default function JournalPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">AI Journal & Context</CardTitle>
          <CardDescription>Your space for qualitative notes, AI memory interactions, and contextual tracking.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <BrainCircuit className="h-16 w-16 text-primary mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Advanced AI Features Under Development!</h2>
          <p className="text-muted-foreground">
            This section will allow you to store journal-style inputs, access AI's memory of your progress
            (e.g., "Last month I started visible abs"), and ask contextual questions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
