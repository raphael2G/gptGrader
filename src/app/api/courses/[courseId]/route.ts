import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { deleteCourse, getCourseById } from '@/services/courseServices';


export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    if (!params.courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Validate that courseId is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(params.courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }

    const course = await getCourseById(new Types.ObjectId(params.courseId));

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

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    if (!params.courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Validate that courseId is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(params.courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }

    const deletedCourse = await deleteCourse(new Types.ObjectId(params.courseId));

    if (!deletedCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(deletedCourse);

  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete course' },
      { status: 500 }
    );
  }
}