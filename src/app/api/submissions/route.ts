import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { upsertSubmission } from '@/services/submissionServices';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate required fields
    const { assignmentId, problemId, studentId, answer } = body;
    if (!assignmentId || !problemId || !studentId || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert string IDs to ObjectIds
    const submissionData = {
      assignmentId: new Types.ObjectId(assignmentId),
      problemId: new Types.ObjectId(problemId),
      studentId: new Types.ObjectId(studentId),
      answer
    };

    const submission = await upsertSubmission(submissionData);

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Failed to create/update submission:', error);
    return NextResponse.json(
      { error: 'Failed to create/update submission' },
      { status: 500 }
    );
  }
}