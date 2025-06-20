// src/lib/firestore.service.ts
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, Timestamp, limit } from 'firebase/firestore';
import type { WorkoutLog, TrainingPlan } from './types';

// ==== WORKOUT LOGS ====

/**
 * Adds a new workout log to a user's collection in Firestore.
 * @param userId The ID of the user.
 * @param workoutData The workout log data (without id and userId).
 */
export async function addWorkoutLog(userId: string, workoutData: Omit<WorkoutLog, 'id' | 'userId'>) {
  try {
    const logDataWithTimestamp = {
      ...workoutData,
      userId,
      date: serverTimestamp(), // Use server-side timestamp for consistency
    };
    const docRef = await addDoc(collection(db, `users/${userId}/workoutLogs`), logDataWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error("Error adding workout log to Firestore:", error);
    throw new Error("Could not save workout log.");
  }
}

/**
 * Fetches all workout logs for a user, sorted by date descending.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of workout logs.
 */
export async function getWorkoutLogs(userId: string): Promise<WorkoutLog[]> {
  try {
    const logsCollection = collection(db, `users/${userId}/workoutLogs`);
    const q = query(logsCollection, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to a serializable format (ISO string)
        date: (data.date as Timestamp).toDate().toISOString(),
      } as unknown as WorkoutLog;
    });
  } catch (error) {
    console.error("Error fetching workout logs from Firestore:", error);
    return [];
  }
}


// ==== TRAINING PLANS ====

/**
 * Adds a new training plan to a user's collection in Firestore.
 * @param userId The ID of the user.
 * @param planData The training plan data.
 */
export async function addTrainingPlan(userId: string, planData: Omit<TrainingPlan, 'id' | 'userId' | 'createdAt'>) {
    try {
        const planWithTimestamp = {
            ...planData,
            userId,
            createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, `users/${userId}/trainingPlans`), planWithTimestamp);
        return docRef.id;
    } catch (error) {
        console.error("Error adding training plan to Firestore:", error);
        throw new Error("Could not save training plan.");
    }
}

/**
 * Fetches all training plans for a user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of training plans.
 */
export async function getTrainingPlans(userId: string): Promise<TrainingPlan[]> {
    try {
        const plansCollection = collection(db, `users/${userId}/trainingPlans`);
        const q = query(plansCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            } as unknown as TrainingPlan;
        });
    } catch (error) {
        console.error("Error fetching training plans from Firestore:", error);
        return [];
    }
}
