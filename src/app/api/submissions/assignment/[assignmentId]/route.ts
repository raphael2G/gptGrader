// app/api/submissions/assignment/[assignmentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { getSubmissionsByAssignment } from '@/services/submissionServices';

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const assignmentId = new Types.ObjectId(params.assignmentId);
    const submissions = await getSubmissionsByAssignment(assignmentId);
    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch assignment submissions: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}