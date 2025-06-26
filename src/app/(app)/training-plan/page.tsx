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
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return (
    <Alert variant="destructive" className="mb-8">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-xl font-bold">DATABASE CONNECTION FAILED</AlertTitle>
      <AlertDescription>
        <div className="my-4 p-3 bg-foreground/10 rounded-md text-center">
          <p className="text-sm font-medium mb-1">Project ID the app is currently using:</p>
          <p className="text-lg font-mono font-bold text-destructive">{projectId || "PROJECT ID NOT FOUND IN .env"}</p>
        </div>
        <p className="mt-2 mb-4 text-base">
           The error `5 NOT_FOUND` combined with **zero usage reported in your Firebase console** means the app is not connecting to the correct Firebase project. This is the most likely cause:
        </p>
        <div className="my-4 p-3 border-l-4 border-destructive bg-foreground/5">
            <p className="font-bold text-lg text-destructive">You might be using the Project Name instead of the Project ID.</p>
            <p className="text-base mt-1">A Firebase **Project Name** is a display name (e.g., "Calisthenics AI"). A **Project ID** is a unique identifier (e.g., "calisthenicsai-a1b2c"). You MUST use the **Project ID** in your `.env` file.</p>
        </div>
        <p className="font-bold text-lg my-2">To fix this, please do the following:</p>
        <ol className="list-decimal list-inside space-y-3 text-base">
          <li>
            Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold text-destructive">Firebase Project Settings</a> (click the ⚙️ icon next to "Project Overview").
          </li>
           <li>
            Find your **Project ID** on the "General" tab.
          </li>
          <li>
            Confirm that the Project ID shown above **exactly matches** the one in your Firebase Console. If it does not, correct the `NEXT_PUBLIC_FIREBASE_PROJECT_ID` value in your `.env` file.
          </li>
          <li>
            In the Firebase Console, go to the **Firestore Database** section.
          </li>
          <li>
            <strong className="text-destructive uppercase">CRITICAL STEP:</strong> You MUST have a database in <strong className="text-destructive">"Native Mode"</strong>. If it says "Datastore Mode", it will not work. You must delete it and create a new one, ensuring you select **Native Mode**.
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
