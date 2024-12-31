// app/api/submissions/[submissionId]/self-grade/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { updateSubmissionSelfGrading } from '@/services/submissionServices';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const submissionId = new Types.ObjectId(params.submissionId);
    const { selfGradedAppliedRubricItems } = await request.json();

    const submission = await updateSubmissionSelfGrading(
      submissionId,
      selfGradedAppliedRubricItems.map((id: string) => new Types.ObjectId(id))
    );

    return NextResponse.json(submission);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update self-grading: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
