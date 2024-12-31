// src/services/submissionServices.ts

import { Types } from 'mongoose';

import { ISubmission } from '@/models/Submission';
import { 
  getSubmissionByIdQuery,
  upsertSubmissionQuery,
  getSubmissionsByStudentIdQuery,
  getSubmissionsByAssignmentIdQuery,
  getSubmissionsByProblemIdQuery, 
  updateSubmissionGradingQuery, 
  updateSubmissionSelfGradingQuery
} from '@/queries/submissionQueries';

/**
 * Gets a submission by its ID
 * @param submissionId ID of the submission
 * @returns The submission document if found
 * @throws Error if the operation fails
 */
export async function getSubmissionById(submissionId: Types.ObjectId): Promise<ISubmission> {
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
 */
export async function upsertSubmission(
  submissionData: Partial<ISubmission> & {
    assignmentId: Types.ObjectId;
    problemId: Types.ObjectId;
    studentId: Types.ObjectId;
  }
): Promise<ISubmission> {
  try {
    const submission = await upsertSubmissionQuery(submissionData);
    if (!submission) {
      throw new Error('Failed to create/update submission');
    }
    return submission;
  } catch (error) {
    throw new Error(`Failed to upsert submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets all submissions for a specific student
 * @param studentId ID of the student
 * @returns Array of submission documents
 */
export async function getSubmissionsByStudent(studentId: Types.ObjectId): Promise<ISubmission[]> {
  try {
    const submissions = await getSubmissionsByStudentIdQuery(studentId);
    return submissions;
  } catch (error) {
    throw new Error(`Failed to fetch student submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets all submissions for a specific assignment
 * @param assignmentId ID of the assignment
 * @returns Array of submission documents
 */
export async function getSubmissionsByAssignment(assignmentId: Types.ObjectId): Promise<ISubmission[]> {
  try {
    const submissions = await getSubmissionsByAssignmentIdQuery(assignmentId);
    return submissions;
  } catch (error) {
    throw new Error(`Failed to fetch assignment submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets all submissions for a specific problem
 * @param problemId ID of the problem
 * @returns Array of submission documents
 */
export async function getSubmissionsByProblem(problemId: Types.ObjectId): Promise<ISubmission[]> {
  try {
    const submissions = await getSubmissionsByProblemIdQuery(problemId);
    return submissions;
  } catch (error) {
    throw new Error(`Failed to fetch problem submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Updates the grading information for a submission
 */
export async function updateSubmissionGrading(
  submissionId: Types.ObjectId,
  gradedBy: Types.ObjectId,
  appliedRubricItems: Types.ObjectId[],
  feedback?: string
): Promise<ISubmission> {
  try {
    const gradingData = {
      gradedBy,
      appliedRubricItems,
      feedback
    };
    
    const updatedSubmission = await updateSubmissionGradingQuery(submissionId, gradingData);

    if (!updatedSubmission){
      throw new Error("For some reason updated submission is null")
    }

    return updatedSubmission;
  } catch (error) {
    throw new Error(`Failed to update submission grading: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Updates the self-grading portion of a submission
 */
export async function updateSubmissionSelfGrading(
  submissionId: Types.ObjectId,
  selfGradedAppliedRubricItems: Types.ObjectId[]
): Promise<ISubmission> {
  try {
    const updatedSubmission = await updateSubmissionSelfGradingQuery(
      submissionId,
      selfGradedAppliedRubricItems
    );

    if (!updatedSubmission){
      throw new Error("For some reason updated submission is null")
    }
    
    return updatedSubmission;
  } catch (error) {
    throw new Error(`Failed to update submission self-grading: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}