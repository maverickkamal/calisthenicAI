// src/app/debug/page.tsx
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';

async function checkFirestoreConnection() {
  try {
    // Attempt to fetch a single document from a collection that should exist ('users').
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(1));
    await getDocs(q);
    // If the above line does not throw, the connection and database were found.
    return { success: true, error: null };
  } catch (error: any) {
    // We return the specific error to display it.
    return { success: false, error: error };
  }
}

export default async function DebugPage() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Not Found in .env";
  const { success, error } = await checkFirestoreConnection();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <HelpCircle className="text-primary" />
            Firebase Firestore Connection Debugger
          </CardTitle>
          <CardDescription>
            This page performs a direct, isolated test of the connection to your Firestore database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Configuration Check</h3>
            <div className="p-3 bg-muted rounded-md border">
              <p className="text-sm font-medium">The app is trying to connect to this Firebase Project ID:</p>
              <p className="text-lg font-mono font-bold text-primary mt-1">{projectId}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              This value comes from the `NEXT_PUBLIC_FIREBASE_PROJECT_ID` variable in your `.env` file.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Connection Status</h3>
            {success ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Connection Successful!</AlertTitle>
                <AlertDescription>
                  The application successfully connected to the Firestore database for project '{projectId}'. If you're still having issues, the problem might be with specific data queries or user permissions.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Connection Failed</AlertTitle>
                <AlertDescription>
                   <p className="mb-2">The connection attempt failed. This is the root cause of the issues in the app.</p>
                   {error?.code === 'not-found' ? (
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
                   ) : (
                     <pre className="mt-2 text-xs bg-foreground/10 p-2 rounded-md whitespace-pre-wrap">
                       {error?.message || 'An unknown error occurred.'}
                     </pre>
                   )}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <Link href="/login" className="text-primary hover:underline text-sm">&larr; Back to Login</Link>
        </CardContent>
      </Card>
    </div>
  );
}
