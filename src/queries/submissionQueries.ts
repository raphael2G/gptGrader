// src/queries/submissionQueries.ts

import { Types } from 'mongoose';
import { Submission, ISubmission } from '@/models/Submission';

interface UpsertSubmissionData extends Partial<Omit<ISubmission, '_id' | 'createdAt' | 'updatedAt'>> {
  assignmentId: Types.ObjectId;  // These three fields are always required
  problemId: Types.ObjectId;     // to identify a unique submission
  studentId: Types.ObjectId;
}

/**
 * Gets a submission by its ID
 */
export async function getSubmissionByIdQuery(submissionId: Types.ObjectId): Promise<ISubmission | null> {
  return await Submission.findById(submissionId);
}

/**
 * Creates or updates a submission
 */
export async function upsertSubmissionQuery(submissionData: UpsertSubmissionData): Promise<ISubmission> {
  const filter = {
    assignmentId: submissionData.assignmentId,
    problemId: submissionData.problemId,
    studentId: submissionData.studentId
  };

  // If this is a new submission, set these default values
  const defaults = {
    submittedAt: new Date(),
    graded: false,
    selfGraded: false,
    selfGradedAppliedRubricItems: [],
    appliedRubricItems: []
  };

  // Handle special cases in the update
  if (submissionData.selfGraded) {
    submissionData.selfGradingCompletedAt = new Date();
  }

  // Combine defaults with submitted data, but only for new documents
  return await Submission.findOneAndUpdate(
    filter,
    { 
      $setOnInsert: defaults,
      $set: submissionData
    },
    { 
      new: true,      // Return the updated/inserted document
      upsert: true    // Create if doesn't exist
    }
  );
}

/**
 * Gets all submissions by a student
 */
export async function getSubmissionsByStudentQuery(studentId: Types.ObjectId): Promise<ISubmission[]> {
  return await Submission.find({ studentId: studentId });
}

/**
 * Gets all submissions for an assignment
 */
export async function getSubmissionsByAssignmentQuery(assignmentId: Types.ObjectId): Promise<ISubmission[]> {
  return await Submission.find({ assignmentId: assignmentId });
}

/**
 * Gets all submissions for a problem
 */
export async function getSubmissionsByProblemQuery(problemId: Types.ObjectId): Promise<ISubmission[]> {
  return await Submission.find({ problemId: problemId });
}

