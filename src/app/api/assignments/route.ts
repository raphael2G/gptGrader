// app/api/assignments/route.ts
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { createAssignment } from '@/services/assignmentServices';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, ...assignmentData } = body;

    if (!courseId || !assignmentData.title || !assignmentData.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const assignment = await createAssignment(
      new Types.ObjectId(courseId),
      assignmentData
    );

    return NextResponse.json(assignment);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
