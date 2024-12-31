// app/api/submissions/[submissionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { getSubmissionById } from '@/services/submissionServices';

export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const submissionId = new Types.ObjectId(params.submissionId);
    const submission = await getSubmissionById(submissionId);
    return NextResponse.json(submission);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch submission: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}