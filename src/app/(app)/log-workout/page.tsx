// src/app/(app)/log-workout/page.tsx
import { WorkoutLogForm } from '@/components/log-workout/WorkoutLogForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log Workout - CalisthenicsAI',
  description: 'Log your daily calisthenics workout session.',
};

export default function LogWorkoutPage() {
  return (
    <div className="container mx-auto py-8">
      <WorkoutLogForm />
    </div>
  );
}
