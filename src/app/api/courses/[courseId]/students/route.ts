// app/api/courses/[courseId]/students/route.ts

import { NextResponse } from 'next/server';
import { addStudent } from '@/services/courseServices';
import { Types } from 'mongoose';

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { studentId } = await req.json();
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const course = await addStudent(
      new Types.ObjectId(params.courseId),
      new Types.ObjectId(studentId)
    );

    return NextResponse.json(course);

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add student to course' },
      { status: 500 }
    );
  }
}