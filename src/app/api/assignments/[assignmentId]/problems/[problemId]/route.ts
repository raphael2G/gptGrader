
// app/api/assignments/[assignmentId]/problems/[problemId]/route.ts
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { deleteProblem } from '@/services/assignmentServices';

export async function DELETE(
  req: Request,
  { params }: { params: { assignmentId: string; problemId: string } }
) {
  try {
    const assignment = await deleteProblem(
      new Types.ObjectId(params.assignmentId),
      new Types.ObjectId(params.problemId)
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
      { error: error instanceof Error ? error.message : 'Failed to delete problem' },
      { status: 500 }
    );
  }
}
