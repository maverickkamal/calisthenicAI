// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check for missing Firebase configuration environment variables
const requiredEnvVars: (keyof typeof firebaseConfigValues)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

for (const key of requiredEnvVars) {
  if (!firebaseConfigValues[key]) {
    const specificEnvName = `NEXT_PUBLIC_FIREBASE_${key === 'apiKey' ? 'API_KEY' : key.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, '')}`;
    
    throw new Error(
      `Firebase configuration error: Missing environment variable ${specificEnvName}. ` +
      `Please ensure it is correctly set in your .env file or environment. ` +
      `Current value for ${key}: '${firebaseConfigValues[key]}'`
    );
  }
}

// Log the configuration being used to help with debugging.
// This will appear in the server-side console.
console.log("Firebase Config Used:", firebaseConfigValues);


let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfigValues);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
