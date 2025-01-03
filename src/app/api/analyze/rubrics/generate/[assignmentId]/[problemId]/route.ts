// src/app/api/analyze/rubrics/generate/[assignmentId]/[problemId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { generateAndUpdateRubric } from '@/analysis/LLMs/GPT/rubric/serviecs/generateRubric';

export async function POST(
  req: NextRequest,
  { params }: { params: { assignmentId: string; problemId: string } }
) {
  try {
    const { assignmentId, problemId } = params;

    // Validate assignmentId and problemId
    if (!Types.ObjectId.isValid(assignmentId) || !Types.ObjectId.isValid(problemId)) {
      return NextResponse.json(
        { error: 'Invalid assignment or problem ID' },
        { status: 400 }
      );
    }

    // Parse request body for additional context (if provided)
    const body = await req.json();
    const additionalContext = body?.additionalContext || undefined;

    // Call the LLM rubric generation service
    const rubric = await generateAndUpdateRubric(
      new Types.ObjectId(assignmentId),
      new Types.ObjectId(problemId),
      additionalContext
    );

    return NextResponse.json(rubric);
  } catch (error) {
    console.error('Error generating rubric:', error);
    return NextResponse.json(
      { error: 'Failed to generate rubric' },
      { status: 500 }
    );
  }
}
