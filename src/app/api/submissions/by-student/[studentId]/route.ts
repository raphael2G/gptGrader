// app/api/submissions/by-student/[studentId]/route.ts
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { getSubmissionsByStudent } from '@/services/submissionServices';

interface RouteParams {
  params: {
    studentId: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const studentId = new Types.ObjectId(params.studentId);
    const submissions = await getSubmissionsByStudent(studentId);
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Failed to fetch student submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student submissions' },
      { status: 500 }
    );
  }
}
