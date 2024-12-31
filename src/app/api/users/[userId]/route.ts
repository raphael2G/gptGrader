import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { getUserById } from '@/services/userServices';


export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    if (!params.userId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Validate that courseId is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(params.userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    const course = await getUserById(new Types.ObjectId(params.userId));

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch course' },
      { status: 500 }
    );
  }
}