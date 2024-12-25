// app/api/users/[userId]/courses/route.ts
import { NextResponse } from 'next/server';
import { getStudentCourses, getInstructorCourses } from '@/services/userServices';
import { Types } from 'mongoose';

//user/[userId]/courses?type=[enrolled OR teaching]
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    
    // Validate userId format
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { 
          error: 'Invalid user ID format',
          details: 'The provided user ID is not a valid MongoDB ObjectId'
        },
        { status: 400 }
      );
    }

    // Validate query parameter
    if (!type) {
      return NextResponse.json(
        { 
          error: 'Missing query parameter',
          details: 'The "type" query parameter is required (enrolled or teaching)'
        },
        { status: 400 }
      );
    }

    if (type !== 'enrolled' && type !== 'teaching') {
      return NextResponse.json(
        { 
          error: 'Invalid course type',
          details: 'The "type" parameter must be either "enrolled" or "teaching"'
        },
        { status: 400 }
      );
    }

    // Fetch appropriate courses
    const courses = type === 'enrolled' 
      ? await getStudentCourses(new Types.ObjectId(userId))
      : await getInstructorCourses(new Types.ObjectId(userId));

    return NextResponse.json({
      data: courses,
      metadata: {
        count: courses.length,
        type: type
      }
    });

  } catch (error) {
    console.error('Error fetching user courses:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch courses',
        details: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}