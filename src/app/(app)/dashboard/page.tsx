// src/app/(app)/dashboard/page.tsx
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Activity, Dumbbell, Lightbulb, Target } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Dashboard - CalisthenicsAI',
  description: 'Your CalisthenicsAI dashboard.',
};

export default function DashboardPage() {
  // Placeholder data - replace with actual data fetching
  const userName = "User"; // Fetch from user session/profile
  const quickStats = [
    { title: "Workouts This Week", value: "3", icon: Dumbbell, color: "text-primary" },
    { title: "Active Streak", value: "12 days", icon: Activity, color: "text-green-500" },
    { title: "Next Goal", value: "15 Pike Pushups", icon: Target, color: "text-accent" },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-headline">Welcome back, {userName}!</h1>
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
                  "Based on your recent fatigue levels, consider a mobility day tomorrow. You've hit 5 push sessions this week!"
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
          <CardDescription>AI-generated insights from your last session.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* This section will be populated by AI summary after workout logging */}
          <div id="workout-summary-display" className="p-4 bg-card-foreground/5 rounded-md min-h-[100px]">
            <p className="text-muted-foreground italic">Your latest workout summary will appear here after you log a session.</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
