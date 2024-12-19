import { Course } from '@/models/Course';
import { User } from '@/models/User';
import { ICourse } from '@/models/Course';
import mongoose, { Types } from 'mongoose';
import dbConnect from '@/lib/mongodb/dbConnect';


/**
 * Fetch a course by its ID
 * @param courseId - The MongoDB ObjectId of the course to fetch
 * @returns Promise containing the course document or null if not found
 */
export const getCourseByIdQuery = async (courseId: Types.ObjectId) => {
  await dbConnect();
  
  try {
    const course = await Course.findById(courseId)
    return course;
  } catch (error) {
    throw new Error(`Failed to get course: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};


/**
 * Creates a new course in the database with the creator automatically set as an instructor
 * @param courseData - The course information to create the new course
 * @param creatorId - The MongoDB ObjectId of the user creating the course
 * @returns Promise containing the newly created course document
 * @throws {Error} If course code already exists or if required fields are missing
 */
export const createCourseQuery = async (
  courseData: Omit<ICourse, '_id' | 'instructors' | 'students' | 'assignments' | 'createdAt' | 'updatedAt'>,
  creatorId: Types.ObjectId
) => {
  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check for existing course code
    const existingCourse = await Course.findOne({
      courseCode: courseData.courseCode
    }).session(session);

    if (existingCourse) {
      throw new Error('Course code already exists in the system');
    }

    // Create the course with creator as instructor
    const course = new Course({
      ...courseData,
      instructors: [creatorId],
      students: [],
      assignments: []
    });

    // Save the course
    const savedCourse = await course.save({ session });

    // Update the creator's managingCourses
    await User.findByIdAndUpdate(
      creatorId,
      { $addToSet: { managingCourses: savedCourse._id } },
      { session }
    );

    await session.commitTransaction();
    return savedCourse;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Updates an existing course's details
 * @param courseId - The MongoDB ObjectId of the course to update
 * @param updateData - Partial course data containing fields to update
 * @returns Promise containing the updated course document
 * @throws {Error} If course is not found or if update validation fails
 */
export const updateCourseQuery = async (
  courseId: Types.ObjectId,
  updateData: Partial<Omit<ICourse, '_id | createdAt' | 'updatedAt'>>
) => {
  await dbConnect();

  // If courseCode is being updated, check for uniqueness
  if (updateData.courseCode) {
    const existingCourse = await Course.findOne({
      courseCode: updateData.courseCode,
      _id: { $ne: courseId } // Exclude current course from check
    });

    if (existingCourse) {
      throw new Error('Course code already exists in the system');
    }
  }
  
  return Course.findByIdAndUpdate(
    courseId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('instructors', 'name email')
   .populate('students', 'name email')
   .populate('assignments');
};

/**
 * Deletes a course and removes all references to it from related collections
 * @param courseId - The MongoDB ObjectId of the course to delete
 * @returns Promise containing the deleted course document
 * @throws {Error} If deletion fails or if database connection fails
 */
export const deleteCourseQuery = async (courseId: Types.ObjectId) => {
  await dbConnect();
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Remove course references from all related users
    await User.updateMany(
      { $or: [
        { enrolledCourses: courseId },
        { managingCourses: courseId }
      ]},
      { 
        $pull: { 
          enrolledCourses: courseId,
          managingCourses: courseId 
        }
      },
      { session }
    );

    // Delete the course
    const deletedCourse = await Course.findByIdAndDelete(courseId).session(session);
    
    await session.commitTransaction();
    return deletedCourse;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Adds a student to a course and updates both course and student records
 * @param courseId - The MongoDB ObjectId of the course
 * @param studentId - The MongoDB ObjectId of the student to add
 * @returns Promise containing the updated course document
 * @throws {Error} If either update fails or if database connection fails
 */
export const addStudentToCourseQuery = async (
  courseId: Types.ObjectId,
  studentId: Types.ObjectId
) => {
  await dbConnect();
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { students: studentId } },
      { new: true, session }
    );

    await User.findByIdAndUpdate(
      studentId,
      { $addToSet: { enrolledCourses: courseId } },
      { session }
    );

    await session.commitTransaction();
    return updatedCourse;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Removes a student from a course and updates both course and student records
 * @param courseId - The MongoDB ObjectId of the course
 * @param studentId - The MongoDB ObjectId of the student to remove
 * @returns Promise containing the updated course document
 * @throws {Error} If either update fails or if database connection fails
 */
export const removeStudentFromCourseQuery = async (
  courseId: Types.ObjectId,
  studentId: Types.ObjectId
) => {
  await dbConnect();
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $pull: { students: studentId } },
      { new: true, session }
    );

    await User.findByIdAndUpdate(
      studentId,
      { $pull: { enrolledCourses: courseId } },
      { session }
    );

    await session.commitTransaction();
    return updatedCourse;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Adds an instructor to a course and updates both course and instructor records
 * @param courseId - The MongoDB ObjectId of the course
 * @param instructorId - The MongoDB ObjectId of the instructor to add
 * @returns Promise containing the updated course document
 * @throws {Error} If either update fails or if database connection fails
 */
export const addInstructorToCourseQuery = async (
  courseId: Types.ObjectId,
  instructorId: Types.ObjectId
) => {
  await dbConnect();
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { instructors: instructorId } },
      { new: true, session }
    );

    await User.findByIdAndUpdate(
      instructorId,
      { $addToSet: { managingCourses: courseId } },
      { session }
    );

    await session.commitTransaction();
    return updatedCourse;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Removes an instructor from a course and updates both course and instructor records
 * @param courseId - The MongoDB ObjectId of the course
 * @param instructorId - The MongoDB ObjectId of the instructor to remove
 * @returns Promise containing the updated course document
 * @throws {Error} If either update fails or if database connection fails
 */
export const removeInstructorFromCourseQuery = async (
  courseId: Types.ObjectId,
  instructorId: Types.ObjectId
) => {
  await dbConnect();
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $pull: { instructors: instructorId } },
      { new: true, session }
    );

    await User.findByIdAndUpdate(
      instructorId,
      { $pull: { managingCourses: courseId } },
      { session }
    );

    await session.commitTransaction();
    return updatedCourse;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


/**
 * Finds a course by its course code
 */
export const findCourseByCodeQuery = async (courseCode: string) => {
  await dbConnect();
  return Course.findOne({ courseCode });
};

/**
 * Adds a student to a course by course code
 * Handles both course and user updates in a transaction
 */
export const joinCourseByCodeQuery = async (
  courseCode: string,
  studentId: Types.ObjectId
) => {
  await dbConnect();
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the course and verify it exists
    const course = await Course.findOne({ courseCode }).session(session);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if student is already enrolled
    if (course.students.includes(studentId)) {
      throw new Error('Student is already enrolled in this course');
    }

    // Add student to course
    const updatedCourse = await Course.findByIdAndUpdate(
      course._id,
      { $addToSet: { students: studentId } },
      { new: true, session }
    );

    // Add course to student's enrolled courses
    await User.findByIdAndUpdate(
      studentId,
      { $addToSet: { enrolledCourses: course._id } },
      { session }
    );

    await session.commitTransaction();
    return updatedCourse;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
