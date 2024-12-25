
// app/api/assignments/[assignmentId]/rubric-items/route.ts
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { upsertRubricItem } from '@/services/assignmentServices';

export async function POST(
  req: Request,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const { problemId, ...rubricItemData } = await req.json();

    if (!problemId) {
      return NextResponse.json(
        { error: 'Problem ID is required' },
        { status: 400 }
      );
    }

    const assignment = await upsertRubricItem(
      new Types.ObjectId(params.assignmentId),
      new Types.ObjectId(problemId),
      rubricItemData
    );

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment or problem not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upsert rubric item' },
      { status: 500 }
    );
  }
}
