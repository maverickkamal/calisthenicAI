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
        <div className="space-y-4 my-2 p-3 border-l-4 border-destructive bg-foreground/5">
            <p className="font-bold text-lg text-destructive">The error is `5 NOT_FOUND`.</p>
            <p className="text-base">This confirms the app is not connecting to the correct Firebase project or the database is in the wrong mode. It means your `.env` file might have the wrong **Project ID**, or your database was created in **Datastore Mode**.</p>
            <ol className="list-decimal list-inside space-y-2 text-base mt-2">
                <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold">Firebase Project Settings</a> (click the ⚙️ icon).</li>
                <li>On the "General" tab, find your **Project ID**. It is a unique identifier, not the display name.</li>
                <li>Confirm the Project ID in your `.env` file **exactly matches** the one in the console.</li>
                <li>Go to the **Firestore Database** section in the Firebase console.</li>
                <li><strong className="uppercase">Crucially:</strong> If the database page says "Datastore Mode", you must delete it and create a new one. Ensure you select **Native Mode**. This cannot be changed later.</li>
            </ol>
        </div>
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
