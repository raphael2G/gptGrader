import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { updateSubmissionSelfGrading } from '@/services/submissionServices';

interface RouteParams {
  params: {
    submissionId: string;
  };
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const submissionId = new Types.ObjectId(params.submissionId);
    const body = await req.json();
    
    // Validate required fields
    const { selfGradedAppliedRubricItems } = body;
    if (!selfGradedAppliedRubricItems || !Array.isArray(selfGradedAppliedRubricItems)) {
      return NextResponse.json(
        { error: 'Missing or invalid selfGradedAppliedRubricItems' },
        { status: 400 }
      );
    }

    // Convert string IDs to ObjectIds
    const selfGradingData = {
      selfGradedAppliedRubricItems: selfGradedAppliedRubricItems.map(
        (id: string) => new Types.ObjectId(id)
      )
    };

    const updatedSubmission = await updateSubmissionSelfGrading(
      submissionId,
      selfGradingData
    );

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error('Failed to update self-grading:', error);
    return NextResponse.json(
      { error: 'Failed to update self-grading' },
      { status: 500 }
    );
  }
}