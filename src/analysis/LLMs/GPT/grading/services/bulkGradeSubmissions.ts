import { Types } from 'mongoose';
import pLimit from 'p-limit';
import { analyzeProblemSubmission } from './gradeSubmission';
import { getSubmissionsByAssignment } from '@/services/submissionServices';

import { IBulkGradingProgress } from '@/analysis/interfaces/grading';
/**
 * Grades all ungraded submissions for a specific assignment problem
 * @param assignmentId - The assignment ID
 * @param problemId - The specific problem ID within the assignment
 * @param concurrency - Maximum number of parallel grading operations (default: 3)
 * @param progressCallback - Optional callback to report progress
 */
export async function gradeAllSubmissions(
  assignmentId: Types.ObjectId,
  problemId: Types.ObjectId,
  concurrency = 1,
  progressCallback?: (progress: IBulkGradingProgress) => void
): Promise<IBulkGradingProgress> {
  try {



    // Get all ungraded submissions for this assignment/problem
    console.log("assignmentId:", assignmentId)
    console.log("problemId:", problemId)
    const assignmentSubmissions = await getSubmissionsByAssignment(assignmentId);
    const problemSubmissions = assignmentSubmissions.filter(p => p.problemId.toString() === problemId.toString())
    const ungradedSubmissions = problemSubmissions.filter(sub => !sub.graded);

    console.log("here are all the ungraded submissions:", ungradedSubmissions.length)
    console.log("here are all the problem submissions:", problemSubmissions.length)
    console.log("here are all the assignment submissions:", assignmentSubmissions.length)

    // throw new Error(`${ungradedSubmissions.length}`)

    // Initialize progress tracking
    const progress: IBulkGradingProgress = {
      totalSubmissions: ungradedSubmissions.length,
      completedSubmissions: 0,
      failedSubmissions: 0,
      // results: []
    };

    // Create a rate limiter to control concurrent operations
    const limit = pLimit(concurrency);

    // Create an array of limited grading operations
    const gradingOperations = ungradedSubmissions.map(submission => {
      return limit(async () => {
        try {
          const result = await analyzeProblemSubmission(submission._id);
          
          progress.completedSubmissions++;
          // progress.results.push({
          //   submissionId: submission._id.toString(),
          //   success: true,
          // });

          // Report progress if callback provided
          if (progressCallback) {
            progressCallback({ ...progress });
          }

          return result;
        } catch (error) {
          progress.failedSubmissions++;
          // progress.results.push({
          //   submissionId: submission._id.toString(),
          //   success: false,
          //   error: error instanceof Error ? error.message : 'Unknown error'
          // });

          // Report progress if callback provided
          if (progressCallback) {
            progressCallback({ ...progress });
          }

          // Don't throw error to allow other submissions to continue
          return null;
        }
      });
    });

    // Execute all grading operations with rate limiting
    await Promise.all(gradingOperations);

    return progress;
  } catch (error) {
    console.error('Error in gradeAllSubmissions:', error);
    throw new Error(`Failed to grade submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Utility function to format a progress update for logging or UI display
 */
export function formatGradingProgress(progress: IBulkGradingProgress): string {
  const percentComplete = ((progress.completedSubmissions / progress.totalSubmissions) * 100).toFixed(1);
  
  return `Grading Progress: ${progress.completedSubmissions}/${progress.totalSubmissions} complete (${percentComplete}%)
Failed: ${progress.failedSubmissions}
Successfully graded: ${progress.completedSubmissions - progress.failedSubmissions}`;
}