// src/app/api/analyze/submissions/grade/[submissionId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { analyzeProblemSubmission } from '@/analysis/LLMs/GPT/grading/services/gradeSubmission';

export async function POST(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const { submissionId } = params;

    // Basic validation of the ID format
    if (!Types.ObjectId.isValid(submissionId)) {
      return NextResponse.json(
        { error: 'Invalid submission ID' },
        { status: 400 }
      );
    }

    // Call the LLM service
    const analysis = await analyzeProblemSubmission(new Types.ObjectId(submissionId));

    
    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Error analyzing submission:', error);
    return NextResponse.json(
      { error: 'Failed to analyze submission' },
      { status: 500 }
    );
  }
}