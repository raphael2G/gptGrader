import { Types } from 'mongoose';
import { ICourse } from '@/models/Course';
import { 
  getCourseByIdQuery,
  createCourseQuery,
  deleteCourseQuery,
  updateCourseQuery,
  addStudentToCourseQuery,
  addInstructorToCourseQuery,
  removeStudentFromCourseQuery,
  removeInstructorFromCourseQuery, 
  joinCourseByCodeQuery
} from '@/queries/courseQueries';

interface CreateCourseData extends Omit<ICourse, '_id' | 'instructors' | 'students' | 'assignments' | 'createdAt' | 'updatedAt'> {}


export async function getCourseById(courseId: Types.ObjectId) {
  try {
    const course = await getCourseByIdQuery(courseId);
    return course
  } catch (error) {
    throw new Error(`Failed to get course: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a new course with the specified creator as an instructor
 * @param courseData Course information excluding system-managed fields
 * @param creatorId MongoDB ObjectId of the user creating the course
 * @returns Created course object
 */
export async function createCourse(courseData: CreateCourseData, creatorId: Types.ObjectId) {
  try {


    const course = await createCourseQuery(courseData, creatorId);
    
    return course;
  } catch (error) {
    throw new Error(`Failed to create course: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteCourse(courseId: Types.ObjectId) {
  try {
    const deletedCourse = await deleteCourseQuery(courseId);
    return deletedCourse
  } catch (error) {
    throw new Error(`Failed to delete course: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Adds a student to a course
 * @param courseId MongoDB ObjectId of the course
 * @param studentId MongoDB ObjectId of the student to add
 * @returns Updated course object
 */
export async function addStudent(courseId: Types.ObjectId, studentId: Types.ObjectId) {
  try {
    const course = await addStudentToCourseQuery(courseId, studentId);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  } catch (error) {
    throw new Error(`Failed to add student to course: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Removes a student from a course
 * @param courseId MongoDB ObjectId of the course
 * @param studentId MongoDB ObjectId of the student to remove
 * @returns Updated course object
 */
export async function removeStudent(courseId: Types.ObjectId, studentId: Types.ObjectId) {
  try {
    const course = await removeStudentFromCourseQuery(courseId, studentId);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  } catch (error) {
    throw new Error(`Failed to remove student from course: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Adds an instructor to a course
 * @param courseId MongoDB ObjectId of the course
 * @param instructorId MongoDB ObjectId of the instructor to add
 * @returns Updated course object
 */
export async function addInstructor(courseId: Types.ObjectId, instructorId: Types.ObjectId) {
  try {
    const course = await addInstructorToCourseQuery(courseId, instructorId);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  } catch (error) {
    throw new Error(`Failed to add instructor to course: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Removes an instructor from a course
 * @param courseId MongoDB ObjectId of the course
 * @param instructorId MongoDB ObjectId of the instructor to remove
 * @returns Updated course object
 */
export async function removeInstructor(courseId: Types.ObjectId, instructorId: Types.ObjectId) {
  try {
    const course = await removeInstructorFromCourseQuery(courseId, instructorId);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  } catch (error) {
    throw new Error(`Failed to remove instructor from course: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Updates course details
 * @param courseId MongoDB ObjectId of the course
 * @param updateData Partial course data containing fields to update
 * @returns Updated course object
 */
export async function updateCourseDetails(
  courseId: Types.ObjectId,
  updateData: Partial<Omit<ICourse, '_id' | 'instructors' | 'students' | 'assignments' | 'createdAt' | 'updatedAt'>>
) {
  try {
    const course = await updateCourseQuery(courseId, updateData);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  } catch (error) {
    throw new Error(`Failed to update course details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Service function to handle joining a course by code
 */
export async function joinCourseByCode(courseCode: string, studentId: Types.ObjectId) {
  console.log("trying")
  try {
    const course = await joinCourseByCodeQuery(courseCode, studentId);
    console.log("Course code:", courseCode)
    console.log("Found Course: ")
    console.log(course)
    if (!course) {
      throw new Error('Failed to join course');
    }
    return course;
  } catch (error) {
    throw new Error(`Failed to join course: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}