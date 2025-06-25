// src/app/(app)/dashboard/page.tsx
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Activity, Dumbbell, Lightbulb, Target, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth';
import { getWorkoutLogs } from '@/lib/firestore.service';
import type { WorkoutLog } from '@/lib/types';
import { getTrainingSuggestions, type TrainingSuggestionsInput } from '@/ai/flows/memory-context-flow';
import { differenceInCalendarDays, isToday, isYesterday } from 'date-fns';
import { redirect } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export const metadata: Metadata = {
  title: 'Dashboard - CalisthenicsAI',
  description: 'Your CalisthenicsAI dashboard.',
};

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

async function getNextGoalSuggestion(logs: WorkoutLog[]): Promise<string> {
  if (logs.length === 0) {
    return "Log your first workout to get a personalized goal!";
  }

  const lastLog = logs[0];
  const recentLogs = logs.slice(0, 5); // Use last 5 logs for context

  const workoutLogText = `
    Type: ${lastLog.workoutType}
    Exercises: ${lastLog.exercises.map(ex => `${ex.name} - ${ex.sets} sets of ${ex.reps}`).join(', ')}
    Difficulty: ${lastLog.difficultyRating}/10
    Fatigue: ${lastLog.fatigue}, Soreness: ${lastLog.soreness}, Mood: ${lastLog.mood}, Energy: ${lastLog.energy}
  `;

  const previousWeekSummaryText = recentLogs.map(log => 
    `Date: ${new Date(log.date).toLocaleDateString()}, Type: ${log.workoutType}, Difficulty: ${log.difficultyRating}/10`
  ).join('\n');

  try {
    const input: TrainingSuggestionsInput = {
      workoutLog: workoutLogText,
      userNotes: lastLog.notes || 'No notes provided.',
      previousWeekSummary: previousWeekSummaryText
    };
    const result = await getTrainingSuggestions(input);
    return result.suggestions;
  } catch (error) {
    console.error("Error getting AI suggestion:", error);
    return "Could not generate a goal. Try again later.";
  }
}

function FirestoreErrorWarning() {
  return (
    <Alert variant="destructive" className="mb-8">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Action Required: Cannot Connect to Database</AlertTitle>
      <AlertDescription>
        <p className="mb-2">Your app cannot find the Firestore database. This is a configuration issue in your Firebase project, not a code bug.</p>
        <p className="font-bold text-lg my-2">Please follow these steps exactly:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>Go to your Firebase Project Console.</li>
          <li>In the left sidebar (under Build), click **Firestore Database**.</li>
          <li>Click the **"Create database"** button.</li>
          <li>
            <span className="font-bold text-destructive">CRITICAL STEP:</span> When asked for a database mode, you MUST select **"Native Mode"**.
            If you select "Datastore mode", your app will not work.
          </li>
          <li>For security rules, choose **"Start in test mode"**. You can change this later.</li>
          <li>If a database already exists, please delete it and create a new one to ensure it is in **Native Mode**.</li>
        </ol>
      </AlertDescription>
    </Alert>
  );
}


export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { data: workoutLogs, error: firestoreError } = await getWorkoutLogs(user.uid);
  
  if (firestoreError === 'not-found') {
    return (
      <div className="container mx-auto py-8">
        <FirestoreErrorWarning />
      </div>
    );
  }
  
  if (firestoreError) {
     return (
      <div className="container mx-auto py-8">
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>An Unexpected Error Occurred</AlertTitle>
            <AlertDescription>Could not load dashboard data due to a database connection error. Please try again later.</AlertDescription>
         </Alert>
      </div>
    );
  }


  const streak = calculateStreak(workoutLogs);
  const nextGoal = await getNextGoalSuggestion(workoutLogs);
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
                <p className="text-sm text-foreground">
                  <Lightbulb className="inline-block mr-2 h-4 w-4 text-accent" />
                  &quot;{nextGoal}&quot;
                </p>
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
