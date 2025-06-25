// src/app/(app)/training-plan/page.tsx
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { TrainingPlanForm } from '@/components/training-plan/TrainingPlanForm';
import { getCurrentUser } from '@/lib/auth';
import { getTrainingPlans } from '@/lib/firestore.service';
import { redirect } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export const metadata: Metadata = {
  title: 'My Training Plan - CalisthenicsAI',
  description: 'View and manage your personalized calisthenics training plan.',
};

function FirestoreErrorWarning() {
  return (
    <Alert variant="destructive" className="mb-8">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Action Required: Firestore Database Not Configured</AlertTitle>
      <AlertDescription>
        <p className="mb-2">The app cannot connect to the database. This is usually because Firestore has not been created or is in the wrong mode.</p>
        <p className="font-semibold">Please follow these steps:</p>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>Go to your Firebase Project Console.</li>
          <li>In the left sidebar, under "Build", click **Firestore Database**.</li>
          <li>Click the **"Create database"** button.</li>
          <li>**IMPORTANT:** When prompted, select **"Native Mode"**, not "Datastore mode".</li>
          <li>For security rules, choose **"Start in test mode"** for now.</li>
          <li>If a database already exists, verify it is in **Native Mode**.</li>
        </ol>
      </AlertDescription>
    </Alert>
  );
}

export default async function TrainingPlanPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { data: plans, error: firestoreError } = await getTrainingPlans(user.uid);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Training Plans</h1>
        <p className="text-muted-foreground">Create, view, and manage your custom workout plans.</p>
      </div>
      
      {firestoreError === 'not-found' && <FirestoreErrorWarning />}
      
      <TrainingPlanForm />
      
      <Separator />

      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-headline">Your Saved Plans</h2>
        {firestoreError ? (
          <p className="text-muted-foreground">Could not load saved plans due to a database connection issue.</p>
        ) : plans.length === 0 ? (
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
