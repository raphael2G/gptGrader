import { Types } from 'mongoose';
import { submitAnswerQuery } from '@/queries/submissionQueries';

/**
 * Service function to submit or update a student's answer for a specific problem in an assignment.
 * Handles the submission process and validates all requirements.
 * 
 * @param assignmentId - MongoDB ObjectId of the assignment
 * @param problemId - MongoDB ObjectId of the problem within the assignment
 * @param studentId - MongoDB ObjectId of the student submitting the answer
 * @param answer - The student's answer text
 * 
 * @returns Promise containing the created or updated submission
 * 
 * @throws {Error} If submission fails due to any validation or database errors
 * 
 * @example
 * ```typescript
 * try {
 *   const submission = await submitAnswer(
 *     assignmentId,
 *     problemId,
 *     studentId,
 *     "My answer to the problem"
 *   );
 *   console.log("Submission successful");
 * } catch (error) {
 *   console.error("Failed to submit answer:", error.message);
 * }
 * ```
 */
export async function submitAnswer(
  assignmentId: Types.ObjectId,
  problemId: Types.ObjectId,
  studentId: Types.ObjectId,
  answer: string
) {
  try {
    const submission = await submitAnswerQuery(
      assignmentId,
      problemId,
      studentId,
      answer
    );
    return submission;
  } catch (error) {
    throw new Error(`Failed to submit answer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}