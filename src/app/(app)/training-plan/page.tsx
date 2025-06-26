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
      <AlertTitle className="text-xl font-bold">DATABASE CONNECTION FAILED</AlertTitle>
      <AlertDescription>
        <p className="mt-2 mb-4 text-base">
          This is a **Firebase project configuration issue**, not a bug in the code. Your app cannot find the Firestore database.
        </p>
        <p className="font-bold text-lg my-2">To fix this, please do the following:</p>
        <ol className="list-decimal list-inside space-y-3 text-base">
          <li>
            Go to your <strong className="text-destructive">Firebase Project Console</strong>.
          </li>
          <li>
            In the sidebar, click <strong className="text-destructive">Firestore Database</strong>.
          </li>
          <li>
            If you see a "Create database" button, click it.
          </li>
          <li>
            <strong className="text-destructive uppercase">CRITICAL STEP:</strong> You MUST select <strong className="text-destructive">"Native Mode"</strong> for the database. If you select "Datastore mode", the app will not work.
          </li>
          <li>
            If a database already exists, <strong className="text-destructive">DELETE IT</strong> and create a new one to ensure it is in <strong className="text-destructive">Native Mode</strong>.
          </li>
           <li>
            Finally, double-check that the `NEXT_PUBLIC_FIREBASE_PROJECT_ID` in your `.env` file matches your actual Firebase Project ID.
          </li>
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

  if (firestoreError === 'not-found') {
    return (
      <div className="container mx-auto flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="w-full max-w-2xl">
          <FirestoreErrorWarning />
        </div>
      </div>
    );
  }

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
