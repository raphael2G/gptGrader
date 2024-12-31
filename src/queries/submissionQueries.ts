// src/queries/submissionQueries.ts
import { ISubmission, Submission } from "@/models/Submission";
import { Types } from "mongoose";

interface UpsertSubmissionData extends Partial<Omit<ISubmission, '_id' | 'createdAt' | 'updatedAt'>> {
  assignmentId: Types.ObjectId;
  problemId: Types.ObjectId;
  studentId: Types.ObjectId;
}

export async function getSubmissionByIdQuery(submissionId: Types.ObjectId): Promise<ISubmission | null> {
  return await Submission.findById(submissionId);
}

/**
 * Creates a new submission or updates an existing one
 * First checks for existing submission by student and problem
 * If none exists, creates a new submission
 */
export async function upsertSubmissionQuery(submissionData: Partial<ISubmission>): Promise<ISubmission | null> {
  
  
  // Default values for new submissions
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

  try {
    // Find existing submission by student and problem
    const existingSubmission = await Submission.findOne({
      studentId: submissionData.studentId,
      problemId: submissionData.problemId,
      assignmentId: submissionData.assignmentId
    });

    if (existingSubmission) {
      console.log("foound submission! updating! - -- - - - - - -")
      // Update existing submission
      return await Submission.findByIdAndUpdate(
        existingSubmission._id,
        {
          $set: submissionData
        },
        {
          new: true,
          runValidators: true
        }
      );
    } else {
      // Create new submission with defaults
      console.log("did not find submission! creatung! - -- - - - - - -")

      const newSubmission = new Submission({
        ...defaults,
        ...submissionData
      });
      return await newSubmission.save();
    }
  } catch (error) {
    console.error('Error upserting submission:', error);
    throw error;
  }
}


export async function getSubmissionsByStudentIdQuery(studentId: Types.ObjectId): Promise<ISubmission[]> {
  return await Submission.find({ studentId });
}

export async function getSubmissionsByAssignmentIdQuery(assignmentId: Types.ObjectId): Promise<ISubmission[]> {
  return await Submission.find({ assignmentId });
}

export async function getSubmissionsByProblemIdQuery(problemId: Types.ObjectId): Promise<ISubmission[]> {
  return await Submission.find({ problemId });
}

export async function updateSubmissionGradingQuery(
  submissionId: Types.ObjectId,
  gradingData: {
    gradedBy: Types.ObjectId;
    appliedRubricItems: Types.ObjectId[];
    feedback?: string;
  }
): Promise<ISubmission | null> {
  return await Submission.findByIdAndUpdate(
    submissionId,
    {
      $set: {
        graded: true,
        gradedAt: new Date(),
        gradedBy: gradingData.gradedBy,
        appliedRubricItems: gradingData.appliedRubricItems,
        feedback: gradingData.feedback
      }
    },
    { 
      new: true,
      runValidators: true
    }
  );
}

export async function updateSubmissionSelfGradingQuery(
  submissionId: Types.ObjectId,
  selfGradedAppliedRubricItems: Types.ObjectId[]
): Promise<ISubmission | null> {
  return await Submission.findByIdAndUpdate(
    submissionId,
    {
      $set: {
        selfGraded: true,
        selfGradingCompletedAt: new Date(),
        selfGradedAppliedRubricItems
      }
    },
    { 
      new: true,
      runValidators: true
    }
  );
}