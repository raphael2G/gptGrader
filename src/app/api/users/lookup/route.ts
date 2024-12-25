// app/api/users/lookup/route.ts
import { NextResponse } from 'next/server';
import { findUserByFirebaseIdQuery } from '@/queries/userQueries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const firebaseUid = searchParams.get('firebaseUid');

  if (!firebaseUid) {
    return NextResponse.json(
      { error: 'Missing required parameter: firebaseUid' },
      { status: 400 }
    );
  }

  try {
    const user = await findUserByFirebaseIdQuery(firebaseUid);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Error looking up user:', error);
    return NextResponse.json(
      { error: 'Failed to lookup user' },
      { status: 500 }
    );
  }
}