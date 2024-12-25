// app/api/submissions/by-problem/[problemId]/route.ts
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { getSubmissionsByProblem } from '@/services/submissionServices';

interface RouteParams {
  params: {
    problemId: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const problemId = new Types.ObjectId(params.problemId);
    const submissions = await getSubmissionsByProblem(problemId);
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Failed to fetch problem submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch problem submissions' },
      { status: 500 }
    );
  }
}