import { Assignment } from '@/models/Assignment';
import { Course } from '@/models/Course';
import { Submission } from '@/models/Submission';
import { Types } from 'mongoose';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb/dbConnect';


/**
 * Creates a new submission or updates an existing one for a specific problem in an assignment.
 * If a submission already exists, it will be updated with the new answer and all grading data will be reset.
 * 
 * @param assignmentId - MongoDB ObjectId of the assignment being submitted to
 * @param problemId - MongoDB ObjectId of the specific problem within the assignment
 * @param studentId - MongoDB ObjectId of the student making the submission
 * @param answer - The student's answer text
 * 
 * @returns Promise containing the created or updated submission document
 * 
 * @throws {Error} If:
 * - Assignment doesn't exist
 * - Assignment is not in 'released' status
 * - Problem doesn't exist in the assignment
 * - Student is not enrolled in the course
 * - Submission deadline (including late submission) has passed
 * - Database transaction fails
 * 
 * @example
 * ```typescript
 * try {
 *   const submission = await submitAnswerQuery(
 *     new Types.ObjectId("assignment123"),
 *     new Types.ObjectId("problem456"),
 *     new Types.ObjectId("student789"),
 *     "My answer to the problem"
 *   );
 *   console.log("Submission successful:", submission);
 * } catch (error) {
 *   console.error("Submission failed:", error.message);
 * }
 * ```
 */
export const submitAnswerQuery = async (
  assignmentId: Types.ObjectId,
  problemId: Types.ObjectId,
  studentId: Types.ObjectId,
  answer: string
) => {
  await dbConnect();
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get assignment and validate it exists
    const assignment = await Assignment.findById(assignmentId).session(session);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Validate assignment is released
    if (assignment.status !== 'released') {
      throw new Error('Assignment is not currently accepting submissions');
    }

    // Validate problem exists in assignment
    const problem = assignment.problems.id(problemId);
    if (!problem) {
      throw new Error('Problem not found in assignment');
    }

    // Validate student is enrolled in the course
    const course = await Course.findById(assignment.courseId)
      .select('students')
      .session(session);
    
    if (!course?.students.includes(studentId)) {
      throw new Error('Student is not enrolled in this course');
    }

    // Check submission deadline
    const now = new Date();
    if (now > assignment.lateDueDate) {
      throw new Error('Submission deadline has passed');
    }

    // Check for existing submission
    let submission = await Submission.findOne({
      assignmentId,
      problemId,
      studentId
    }).session(session);

    if (submission) {
      submission.answer = answer;
      submission.submittedAt = now;
      submission.graded = false;  // Reset graded status
      submission.earnedPoints = undefined;  // Clear earned points
      submission.gradedBy = undefined;  // Clear grader reference
      submission.gradedAt = undefined;  // Clear grading timestamp
      submission.appliedRubricItems = [];  // Clear applied rubric items
    } else {
      // Create new submission
      submission = new Submission({
        assignmentId,
        problemId,
        studentId,
        answer,
        submittedAt: now,
        graded: false,
      });
    }

    await submission.save({ session });
    await session.commitTransaction();
    return submission;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};