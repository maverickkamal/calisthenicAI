// src/app/(app)/progress/page.tsx
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Progress - CalisthenicsAI',
  description: 'Visualize your calisthenics progress with charts and summaries.',
};

export default function ProgressPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">My Progress</CardTitle>
          <CardDescription>Track your strength, stamina, and consistency over time.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <BarChart3 className="h-16 w-16 text-primary mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Visualizations Coming Soon!</h2>
          <p className="text-muted-foreground">
            Detailed charts for strength, stamina, core control, plank time, workout balance,
            and calendar heatmaps will be available here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
