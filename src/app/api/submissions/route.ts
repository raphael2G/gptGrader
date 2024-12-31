// app/api/submissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { upsertSubmission } from '@/services/submissionServices';

export async function POST(request: NextRequest) {
  try {
    const submissionData = await request.json();

    // Convert string IDs to MongoDB ObjectIds
    const data = {
      ...submissionData,
      assignmentId: new Types.ObjectId(submissionData.assignmentId),
      problemId: new Types.ObjectId(submissionData.problemId),
      studentId: new Types.ObjectId(submissionData.studentId),
      gradedBy: submissionData.gradedBy ? new Types.ObjectId(submissionData.gradedBy) : undefined,
      appliedRubricItems: submissionData.appliedRubricItems?.map(
        (id: string) => new Types.ObjectId(id)
      ),
      selfGradedAppliedRubricItems: submissionData.selfGradedAppliedRubricItems?.map(
        (id: string) => new Types.ObjectId(id)
      ),
    };

  

    const submission = await upsertSubmission(data);
    return NextResponse.json(submission);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to upsert submission: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}