
// app/api/assignments/[assignmentId]/rubric-items/[itemId]/route.ts
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { deleteRubricItem } from '@/services/assignmentServices';

export async function DELETE(
  req: Request,
  { params }: { params: { assignmentId: string; itemId: string } }
) {
  try {
    const { problemId } = await req.json();

    if (!problemId) {
      return NextResponse.json(
        { error: 'Problem ID is required' },
        { status: 400 }
      );
    }

    const assignment = await deleteRubricItem(
      new Types.ObjectId(params.assignmentId),
      new Types.ObjectId(problemId),
      new Types.ObjectId(params.itemId)
    );

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment, problem, or rubric item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete rubric item' },
      { status: 500 }
    );
  }
}