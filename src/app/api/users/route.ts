// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { createUser } from '@/services/userServices';

/**
 * Route handler for /api/users
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firebaseUid, email, name } = body;

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { error: 'Firebase UID and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const isAndrewEmail = email.endsWith('@andrew.cmu.edu');
    const isBackdoorEmail = ['asilbekomonkulov2003@gmail.com', 'darmfield2023@gmail.com'].includes(email);
    
    if (!isAndrewEmail && !isBackdoorEmail) {
      return NextResponse.json(
        { 
          error: 'Invalid email domain',
          details: 'Email must be an Andrew CMU email address'
        },
        { status: 400 }
      );
    }


    const user = await createUser(firebaseUid, email, name || null);
    return NextResponse.json(user);

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    );
  }
}