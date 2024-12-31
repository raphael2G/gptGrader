// app/api/submissions/student/[studentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { getSubmissionsByStudent } from '@/services/submissionServices';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const studentId = new Types.ObjectId(params.studentId);
    const submissions = await getSubmissionsByStudent(studentId);
    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch student submissions: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}