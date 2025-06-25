// src/lib/firestore.service.ts
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, Timestamp, limit } from 'firebase/firestore';
import type { WorkoutLog, TrainingPlan } from './types';

const firestoreNotFoundError = "Firestore Database Not Found: Please go to your Firebase project console, navigate to 'Firestore Database', and click 'Create database'. IMPORTANT: Ensure you select 'Native Mode' (not Datastore mode) and start in 'Test Mode' for development.";

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
  } catch (error: any) {
    if (error.code === 'not-found') {
        console.error(`\n\n[CalisthenicsAI] FIRESTORE CONFIG ERROR: ${firestoreNotFoundError}\n\n`);
        throw new Error("Firestore Database not found. Check server logs for setup instructions. Ensure it is in Native Mode.");
    }
    console.error("Error adding workout log to Firestore:", error);
    throw new Error("Could not save workout log.");
  }
}

/**
 * Fetches all workout logs for a user, sorted by date descending.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an object with workout logs and a potential error key.
 */
export async function getWorkoutLogs(userId: string): Promise<{ data: WorkoutLog[]; error: string | null; }> {
  try {
    const logsCollection = collection(db, `users/${userId}/workoutLogs`);
    const q = query(logsCollection, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        id: doc.id,
        ...docData,
        // Convert Firestore Timestamp to a serializable format (ISO string)
        date: (docData.date as Timestamp).toDate().toISOString(),
      } as unknown as WorkoutLog;
    });
    return { data, error: null };
  } catch (error: any) {
    if (error.code === 'not-found') {
        console.error(`\n\n[CalisthenicsAI] FIRESTORE CONFIG ERROR: ${firestoreNotFoundError}\n\n`);
        return { data: [], error: 'not-found' };
    }
    console.error("Error fetching workout logs from Firestore:", error);
    return { data: [], error: 'unknown' };
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
    } catch (error: any) {
        if (error.code === 'not-found') {
            console.error(`\n\n[CalisthenicsAI] FIRESTORE CONFIG ERROR: ${firestoreNotFoundError}\n\n`);
            throw new Error("Firestore Database not found. Check server logs for setup instructions. Ensure it is in Native Mode.");
        }
        console.error("Error adding training plan to Firestore:", error);
        throw new Error("Could not save training plan.");
    }
}

/**
 * Fetches all training plans for a user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an object with training plans and a potential error key.
 */
export async function getTrainingPlans(userId: string): Promise<{ data: TrainingPlan[]; error: string | null; }> {
    try {
        const plansCollection = collection(db, `users/${userId}/trainingPlans`);
        const q = query(plansCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map(doc => {
            const docData = doc.data();
            return {
                id: doc.id,
                ...docData,
                createdAt: (docData.createdAt as Timestamp).toDate().toISOString(),
            } as unknown as TrainingPlan;
        });
        return { data, error: null };
    } catch (error: any) {
        if (error.code === 'not-found') {
            console.error(`\n\n[CalisthenicsAI] FIRESTORE CONFIG ERROR: ${firestoreNotFoundError}\n\n`);
            return { data: [], error: 'not-found' };
        }
        console.error("Error fetching training plans from Firestore:", error);
        return { data: [], error: 'unknown' };
    }
}
