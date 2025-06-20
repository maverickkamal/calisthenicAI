// src/app/(app)/training-plan/page.tsx
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { TrainingPlanForm } from '@/components/training-plan/TrainingPlanForm';
import { getCurrentUser } from '@/lib/auth';
import { getTrainingPlans } from '@/lib/firestore.service';
import { redirect } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'My Training Plan - CalisthenicsAI',
  description: 'View and manage your personalized calisthenics training plan.',
};

export default async function TrainingPlanPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const plans = await getTrainingPlans(user.uid);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Training Plans</h1>
        <p className="text-muted-foreground">Create, view, and manage your custom workout plans.</p>
      </div>
      
      <TrainingPlanForm />
      
      <Separator />

      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-headline">Your Saved Plans</h2>
        {plans.length === 0 ? (
          <p className="text-muted-foreground">You haven&apos;t created any plans yet. Use the form above to add your first one!</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{plan.planName}</CardTitle>
                  <CardDescription>Created on {new Date(plan.createdAt).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  {plan.schedule.map((day, index) => (
                    <div key={index}>
                      <h4 className="font-semibold text-primary">{day.day}</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{day.exercises}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
