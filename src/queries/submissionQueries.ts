// src/queries/submissionQueries.ts

import { Types } from 'mongoose';
import { Submission, ISubmission } from '@/models/Submission';

interface CreateSubmissionData {
  assignmentId: Types.ObjectId;
  problemId: Types.ObjectId;
  studentId: Types.ObjectId;
  answer: string;
}

/**
 * Creates a new submission for a problem
 * @param submissionData Data required to create a submission
 * @returns The created submission document
 */
export async function createSubmissionQuery(submissionData: CreateSubmissionData): Promise<ISubmission> {
  try {
    // Check if a submission already exists for this student and problem
    const existingSubmission = await Submission.findOne({
      assignmentId: submissionData.assignmentId,
      problemId: submissionData.problemId,
      studentId: submissionData.studentId
    });

    if (existingSubmission) {
      throw new Error('A submission already exists for this student and problem');
    }

    // Create the new submission with initial values
    const newSubmission = new Submission({
      ...submissionData,
      submittedAt: new Date(),
      graded: false,
      selfGraded: false,
      selfGradedAppliedRubricItems: [],
      appliedRubricItems: []
    });

    // Save and return the new submission
    return await newSubmission.save();
  } catch (error) {
    // Rethrow the error to be handled by the service layer
    throw error;
  }
}