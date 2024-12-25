// app/api/courses/join/route.ts

import { NextResponse } from 'next/server';
import { joinCourseByCode } from '@/services/courseServices';
import { Types } from 'mongoose';

export async function POST(req: Request) {
  try {
    const { courseCode, studentId } = await req.json();
    
    if (!courseCode || !studentId) {
      return NextResponse.json(
        { error: 'Course code and student ID are required' },
        { status: 400 }
      );
    }

    const course = await joinCourseByCode(
      courseCode,
      new Types.ObjectId(studentId)
    );

    return NextResponse.json({ data: course });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to join course' },
      { status: 500 }
    );
  }
}