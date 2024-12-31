import { NextResponse } from 'next/server';
import { updateProblemReferenceSolution } from '@/services/assignmentServices';
import { Types } from 'mongoose';

export async function PATCH(
  request: Request,
  { params }: { params: { assignmentId: string; problemId: string } }
) {
  try {
    const { referenceSolution } = await request.json();
    
    if (!referenceSolution) {
      return NextResponse.json(
        { error: 'Reference solution is required' },
        { status: 400 }
      );
    }

    const updatedAssignment = await updateProblemReferenceSolution(
      new Types.ObjectId(params.assignmentId), 
      new Types.ObjectId(params.problemId), 
      referenceSolution
    );
    


    return NextResponse.json(updatedAssignment);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update reference solution: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
