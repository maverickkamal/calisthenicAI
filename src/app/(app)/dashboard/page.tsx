// src/app/(app)/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Activity, Dumbbell, Lightbulb, Target, AlertTriangle, LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import { getWorkoutLogs } from '@/lib/firestore.service';
import type { WorkoutLog } from '@/lib/types';
import { getTrainingSuggestions, type TrainingSuggestionsInput } from '@/ai/flows/memory-context-flow';
import { differenceInCalendarDays, isToday, isYesterday } from 'date-fns';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

function calculateStreak(logs: WorkoutLog[]): number {
  if (logs.length === 0) {
    return 0;
  }

  let streak = 0;
  let lastWorkoutDate = new Date(logs[0].date);

  if (isToday(lastWorkoutDate) || isYesterday(lastWorkoutDate)) {
    streak = 1;
    for (let i = 1; i < logs.length; i++) {
      const currentDate = new Date(logs[i].date);
      const diff = differenceInCalendarDays(lastWorkoutDate, currentDate);
      if (diff === 1) {
        streak++;
        lastWorkoutDate = currentDate;
      } else if (diff > 1) {
        break; 
      }
      // if diff is 0, it's the same day, so we continue
    }
  }

  return streak;
}


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


export default function DashboardPage() {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
    const [nextGoal, setNextGoal] = useState<string>('Log your first workout to get a personalized goal!');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGoalLoading, setIsGoalLoading] = useState(false);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const { data, error: firestoreError } = await getWorkoutLogs(currentUser.uid);
                
                if (firestoreError) {
                    setError(firestoreError);
                } else {
                    setWorkoutLogs(data);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
      if (user && workoutLogs.length > 0) {
        setIsGoalLoading(true);
        const lastLog = workoutLogs[0];
        const recentLogs = workoutLogs.slice(0, 5);

        const workoutLogText = `
            Type: ${lastLog.workoutType}
            Exercises: ${lastLog.exercises.map(ex => `${ex.name} - ${ex.sets} sets of ${ex.reps}`).join(', ')}
            Difficulty: ${lastLog.difficultyRating}/10
            Fatigue: ${lastLog.fatigue}, Soreness: ${lastLog.soreness}, Mood: ${lastLog.mood}, Energy: ${lastLog.energy}
        `;

        const previousWeekSummaryText = recentLogs.map(log => 
            `Date: ${new Date(log.date).toLocaleDateString()}, Type: ${log.workoutType}, Difficulty: ${log.difficultyRating}/10`
        ).join('\n');

        const input: TrainingSuggestionsInput = {
            workoutLog: workoutLogText,
            userNotes: lastLog.notes || 'No notes provided.',
            previousWeekSummary: previousWeekSummaryText
        };

        getTrainingSuggestions(input)
          .then(result => setNextGoal(result.suggestions))
          .catch(err => {
            console.error("Error getting AI suggestion:", err);
            setNextGoal("Could not generate a goal. Try again later.");
          })
          .finally(() => setIsGoalLoading(false));
      }
    }, [user, workoutLogs]);

    if (isLoading) {
        return (
          <div className="container mx-auto flex h-[calc(100vh-10rem)] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading Your Dashboard...</p>
            </div>
          </div>
        );
    }
    
    if (error === 'not-found') {
        return (
          <div className="container mx-auto flex h-[calc(100vh-10rem)] items-center justify-center">
            <div className="w-full max-w-2xl">
              <FirestoreErrorWarning />
            </div>
          </div>
        );
    }

    if (error) {
        return (
          <div className="container mx-auto py-8">
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>An Unexpected Error Occurred</AlertTitle>
                <AlertDescription>Could not load dashboard data. Please try refreshing the page.</AlertDescription>
             </Alert>
          </div>
        );
    }
    
    const streak = calculateStreak(workoutLogs);
    const workoutsThisWeek = workoutLogs.filter(log => differenceInCalendarDays(new Date(), new Date(log.date)) <= 7).length;

    const quickStats = [
      { title: "Workouts This Week", value: workoutsThisWeek.toString(), icon: Dumbbell, color: "text-primary" },
      { title: "Active Streak", value: `${streak} days`, icon: Activity, color: "text-green-500" },
      { title: "Next Goal Focus", value: "AI Suggestion", icon: Target, color: "text-accent" },
    ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-headline">Welcome back!</h1>
        <p className="text-muted-foreground">Here&apos;s your progress overview and quick actions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Log Today&apos;s Workout</CardTitle>
            <CardDescription>Keep your progress on track by logging your session.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Man doing pushups" 
              width={600} 
              height={400} 
              className="rounded-md object-cover aspect-video"
              data-ai-hint="calisthenics workout" 
            />
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/log-workout">Log Workout <Dumbbell className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">AI Coach Recommendations</CardTitle>
            <CardDescription>Get personalized tips and adjustments for your training.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="AI brain graphic" 
              width={600} 
              height={400} 
              className="rounded-md object-cover aspect-video"
              data-ai-hint="artificial intelligence brain"
            />
             <div className="mt-4 p-4 bg-muted/50 rounded-md">
                {isGoalLoading ? (
                  <div className="flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Generating goal...</span>
                  </div>
                ) : (
                  <p className="text-sm text-foreground">
                    <Lightbulb className="inline-block mr-2 h-4 w-4 text-accent" />
                    &quot;{nextGoal}&quot;
                  </p>
                )}
             </div>
          </CardContent>
           <CardFooter>
            <Button asChild className="w-full" variant="outline">
              <Link href="/recommendations">View All Recommendations</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline">Recent Workout Summary</CardTitle>
          <CardDescription>AI-generated insights from your last session. (Summaries appear after logging a workout).</CardDescription>
        </CardHeader>
        <CardContent>
          {/* This section will be populated by AI summary after workout logging */}
          <div id="workout-summary-display" className="p-4 bg-card-foreground/5 rounded-md min-h-[100px]">
            <p className="text-muted-foreground italic">Your latest workout summary will appear on the results screen after you log a workout. This dashboard shows your stats and goals.</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
