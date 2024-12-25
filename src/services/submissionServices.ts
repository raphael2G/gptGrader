import { Types } from 'mongoose';
import { 
  getSubmissionByIdQuery,
  upsertSubmissionQuery,
  getSubmissionsByStudentQuery,
  getSubmissionsByAssignmentQuery,
  getSubmissionsByProblemQuery
} from '@/queries/submissionQueries';
import { ISubmission } from '@/models/Submission';

/**
 * Gets a submission by its ID
 */
export async function getSubmissionById(submissionId: Types.ObjectId) {
  try {
    const submission = await getSubmissionByIdQuery(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }
    return submission;
  } catch (error) {
    throw new Error(`Failed to fetch submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a new submission or updates an existing one
 * This is primarily used when students submit their answers or when grading is updated
 */
export async function upsertSubmission(
  submissionData: {
    assignmentId: Types.ObjectId;
    problemId: Types.ObjectId;
    studentId: Types.ObjectId;
    answer?: string;
    graded?: boolean;
    gradedBy?: Types.ObjectId;
    appliedRubricItems?: Types.ObjectId[];
    feedback?: string;
    selfGraded?: boolean;
    selfGradedAppliedRubricItems?: Types.ObjectId[];
  }
) {
  try {
    const submission = await upsertSubmissionQuery(submissionData);
    return submission;
  } catch (error) {
    throw new Error(`Failed to upsert submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets all submissions by a specific student
 * Useful for viewing a student's complete submission history
 */
export async function getSubmissionsByStudent(studentId: Types.ObjectId) {
  try {
    const submissions = await getSubmissionsByStudentQuery(studentId);
    return submissions;
  } catch (error) {
    throw new Error(`Failed to fetch student submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets all submissions for a specific assignment
 * Useful for bulk grading or reviewing all student work for an assignment
 */
export async function getSubmissionsByAssignment(assignmentId: Types.ObjectId) {
  try {
    const submissions = await getSubmissionsByAssignmentQuery(assignmentId);
    return submissions;
  } catch (error) {
    throw new Error(`Failed to fetch assignment submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets all submissions for a specific problem
 * Useful when grading a specific problem across all students
 */
export async function getSubmissionsByProblem(problemId: Types.ObjectId) {
  try {
    const submissions = await getSubmissionsByProblemQuery(problemId);
    return submissions;
  } catch (error) {
    throw new Error(`Failed to fetch problem submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Updates the grading for a submission
 * Specialized version of upsertSubmission focused on grading updates
 */
export async function updateSubmissionGrading(
  submissionId: Types.ObjectId,
  gradingData: {
    gradedBy: Types.ObjectId;
    appliedRubricItems: Types.ObjectId[];
    feedback?: string;
  }
) {
  try {
    const submission = await getSubmissionById(submissionId);
    const updatedSubmission = await upsertSubmissionQuery({
      assignmentId: submission.assignmentId,
      problemId: submission.problemId,
      studentId: submission.studentId,
      graded: true,
      gradedAt: new Date(),
      ...gradingData
    });
    return updatedSubmission;
  } catch (error) {
    throw new Error(`Failed to update submission grading: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Updates the self-grading portion of a submission
 * Used when students complete their self-assessment
 */
export async function updateSubmissionSelfGrading(
  submissionId: Types.ObjectId,
  selfGradingData: {
    selfGradedAppliedRubricItems: Types.ObjectId[];
  }
) {
  try {
    const submission = await getSubmissionById(submissionId);
    const updatedSubmission = await upsertSubmissionQuery({
      assignmentId: submission.assignmentId,
      problemId: submission.problemId,
      studentId: submission.studentId,
      selfGraded: true,
      selfGradingCompletedAt: new Date(),
      ...selfGradingData
    });
    return updatedSubmission;
  } catch (error) {
    throw new Error(`Failed to update submission self-grading: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}