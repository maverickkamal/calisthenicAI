import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

const SessionSchema = z.object({
  idToken: z.string().min(1, 'Invalid authentication token.'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = SessionSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { idToken } = validatedData.data;
    const cookieStore = cookies();
    
    cookieStore.set('firebaseAuthToken', idToken, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 2, // 2 hours
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session API Error:', error);
    return NextResponse.json(
      { error: 'Failed to establish session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    cookieStore.delete('firebaseAuthToken');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to clear session' },
      { status: 500 }
    );
  }
}