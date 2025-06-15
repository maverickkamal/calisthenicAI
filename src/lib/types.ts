// src/lib/types.ts

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  // Additional app-specific user profile data
  fitnessLevel?: string;
  goals?: string[];
}

export interface ExerciseLog {
  name: string;
  sets: number;
  reps: number | string; // Reps can be a number or time string e.g., "3:00" for plank
}

export type WorkoutType = "Push" | "Pull" | "Core & Legs" | "Mobility/Recovery";
export type DifficultyRating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type FatigueLevel = "Low" | "Medium" | "High";
export type SorenessLevel = "None" | "Mild" | "Moderate" | "Severe";
export type Mood = "Great" | "Good" | "Okay" | "Bad" | "Awful";
export type EnergyLevel = "High" | "Medium" | "Low";

export interface WorkoutLog {
  id?: string; // Firestore document ID
  userId: string;
  date: Date;
  workoutType: WorkoutType;
  exercises: ExerciseLog[];
  difficultyRating: DifficultyRating;
  fatigue: FatigueLevel;
  soreness: SorenessLevel;
  mood: Mood;
  energy: EnergyLevel;
  notes?: string;
  durationMinutes?: number; // Optional: duration of the workout
}

export interface WorkoutSummary {
  summary: string;
  trends: string;
  progressHighlights: string;
}

export interface TrainingPlan {
  id?: string;
  userId: string;
  planName: string;
  // Structure for daily workouts, e.g., Day 1: Push, Day 2: Pull, etc.
  schedule: Array<{
    day: string; // e.g., "Monday", "Day 1"
    workoutType: WorkoutType;
    exercises: ExerciseLog[]; // Suggested exercises
  }>;
  warnings?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  frequency: string; // e.g., "3 times a week"
  intensity: string; // e.g., "High"
  goals: string[]; // e.g., ["Increase push-up reps", "Learn pistol squats"]
}

export interface AIRecommendation {
  routineAdaptation: string;
  exerciseProgressions: string[];
  additionalTips: string;
}

// Data for charts
export interface ProgressDataPoint {
  date: string; // Or Date object
  value: number;
}

export interface StrengthProgress {
  exerciseName: string;
  data: ProgressDataPoint[];
}

export interface CalendarHeatmapData {
  date: string; // YYYY-MM-DD
  count: number; // Number of workouts or intensity
  level?: 0 | 1 | 2 | 3 | 4; // For react-activity-calendar like coloring
}
