// src/app/(app)/training-plan/page.tsx
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Training Plan - CalisthenicsAI',
  description: 'View and manage your personalized calisthenics training plan.',
};

export default function TrainingPlanPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">My Training Plan</CardTitle>
          <CardDescription>Your AI-generated personalized training schedule and exercises.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <Construction className="h-16 w-16 text-primary mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Coming Soon!</h2>
          <p className="text-muted-foreground">
            This section will display your personalized training plan, help you select exercises,
            and provide AI-driven adjustments. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
