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
    
    // Optional query parameters for filtering
    const { graded, selfGraded } = Object.fromEntries(
      new URL(req.url).searchParams
    );

    // Convert string parameters to boolean if they exist
    const filters = {
      ...(graded !== undefined && { graded: graded === 'true' }),
      ...(selfGraded !== undefined && { selfGraded: selfGraded === 'true' })
    };

    const submissions = await getSubmissionsByProblem(problemId, filters);
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Failed to fetch problem submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch problem submissions' },
      { status: 500 }
    );
  }
}