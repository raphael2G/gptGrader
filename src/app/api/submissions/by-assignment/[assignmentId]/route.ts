// app/api/submissions/by-assignment/[assignmentId]/route.ts
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { getSubmissionsByAssignment } from '@/services/submissionServices';

interface RouteParams {
  params: {
    assignmentId: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const assignmentId = new Types.ObjectId(params.assignmentId);
    const submissions = await getSubmissionsByAssignment(assignmentId);
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Failed to fetch assignment submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignment submissions' },
      { status: 500 }
    );
  }
}