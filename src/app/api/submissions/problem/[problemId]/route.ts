// app/api/submissions/problem/[problemId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { getSubmissionsByProblem } from '@/services/submissionServices';

export async function GET(
  request: NextRequest,
  { params }: { params: { problemId: string } }
) {
  try {
    const problemId = new Types.ObjectId(params.problemId);
    const submissions = await getSubmissionsByProblem(problemId);
    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch problem submissions: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}