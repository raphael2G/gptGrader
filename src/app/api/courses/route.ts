// src/app/api/courses/route.ts

import { NextResponse } from 'next/server';
import { createCourse } from '@/services/courseServices';
import { Types } from 'mongoose';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, courseCode, description, instructor, semester, year, creatorId } = body;

    // Validate required fields
    if (!title || !courseCode || !description || !instructor || !creatorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const course = await createCourse(
      { title, courseCode, description, instructor, semester, year },
      new Types.ObjectId(creatorId)
    );

    return NextResponse.json(course);

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create course' },
      { status: 500 }
    );
  }
}