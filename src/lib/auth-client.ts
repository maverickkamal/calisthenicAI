// Client-side authentication utilities
'use client';

export async function createSession(idToken: string): Promise<boolean> {
  try {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create session');
    }

    return true;
  } catch (error) {
    console.error('Failed to create session:', error);
    throw error;
  }
}

export async function clearSession(): Promise<boolean> {
  try {
    const response = await fetch('/api/session', {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to clear session');
    }

    return true;
  } catch (error) {
    console.error('Failed to clear session:', error);
    throw error;
  }
}