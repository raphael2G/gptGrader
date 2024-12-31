// app/api/submissions/[submissionId]/grade/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { updateSubmissionGrading } from '@/services/submissionServices';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const { gradedBy, appliedRubricItems, feedback } = await request.json();
    console.log(params.submissionId)
    console.log(gradedBy)
    console.log(appliedRubricItems)
    console.log(feedback)

    const submission = await updateSubmissionGrading(
      new Types.ObjectId(params.submissionId),
      gradedBy,
      appliedRubricItems.map((id: string) => new Types.ObjectId(id)),
      feedback
    );



    return NextResponse.json(submission);
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: `Failed to update grading: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}