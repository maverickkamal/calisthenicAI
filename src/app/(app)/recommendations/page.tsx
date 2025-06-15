// src/app/(app)/recommendations/page.tsx
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Coach Recommendations - CalisthenicsAI',
  description: 'Get AI-driven recommendations to adapt your routines and progress smarter.',
};

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">AI Coach Recommendations</CardTitle>
          <CardDescription>Personalized advice based on your fatigue, sleep, soreness, and progress.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <Sparkles className="h-16 w-16 text-primary mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Smart Coaching In Progress!</h2>
          <p className="text-muted-foreground">
            Receive AI-generated recommendations for adapting your routines, exercise progressions,
            and weekly digests here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
