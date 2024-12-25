
// app/api/assignments/[assignmentId]/route.ts
import { NextResponse } from 'next/server';
import { updateAssignment, deleteAssignment, getAssignmentById } from '@/services/assignmentServices';
import { Types } from 'mongoose';


export async function GET(
  req: Request,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const assignment = await getAssignmentById(new Types.ObjectId(params.assignmentId));
    return NextResponse.json(assignment);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch assignment' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const body = await req.json();
    const assignment = await updateAssignment(
      new Types.ObjectId(params.assignmentId),
      body
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
      { error: error instanceof Error ? error.message : 'Failed to update assignment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const assignment = await deleteAssignment(
      new Types.ObjectId(params.assignmentId)
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
      { error: error instanceof Error ? error.message : 'Failed to delete assignment' },
      { status: 500 }
    );
  }
}
