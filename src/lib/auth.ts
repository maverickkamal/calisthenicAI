// src/lib/auth.ts
'use server';
import { cookies } from 'next/headers';

// In a real production app, you MUST use the Firebase Admin SDK to verify the token's signature.
// This is a simplified function for demonstration purposes to extract the UID from the token payload without verification.
export async function getCurrentUser(): Promise<{ uid: string; email: string; } | null> {
  const token = cookies().get('firebaseAuthToken')?.value;

  if (!token) {
    return null;
  }

  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        console.error("Invalid token format");
        return null;
    }
    const payloadBase64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
    
    // Using Buffer is more robust for decoding base64 in different JS environments (Node.js/edge) than atob.
    const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const payload = JSON.parse(decodedPayload);
    
    // Firebase ID tokens store the UID in the 'user_id' and 'sub' fields.
    const uid = payload.user_id || payload.sub;
    if (uid) {
        return { uid, email: payload.email };
    }
    return null;
  } catch (error) {
    console.error("Failed to decode auth token:", error);
    return null;
  }
}
