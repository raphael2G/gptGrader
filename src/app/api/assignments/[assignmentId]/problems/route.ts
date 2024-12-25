
// app/api/assignments/[assignmentId]/problems/route.ts
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { upsertProblem } from '@/services/assignmentServices';


export async function POST(
  req: Request,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const problemData = await req.json();
    const assignment = await upsertProblem(
      new Types.ObjectId(params.assignmentId),
      problemData
    );

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upsert problem' },
      { status: 500 }
    );
  }
}
