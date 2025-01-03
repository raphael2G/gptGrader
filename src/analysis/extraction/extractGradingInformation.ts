import { Types } from "mongoose";

import { IRubricItem } from "@/models/Assignment";
import { getAssignmentById } from "@/services/assignmentServices";
import { getSubmissionById } from "@/services/submissionServices";

interface RelevantPreGradingInformation {
  question: string;
  referenceSolution: string;
  rubric: IRubricItem[];
  studentResponse: string
}
export async function extractRelevantGradingInformation(submissionId: Types.ObjectId) {
  try {
    // Get the submission
    const submission = await getSubmissionById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    // Get the assignment containing the problem
    const assignment = await getAssignmentById(submission.assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Find the specific problem within the assignment
    const problem = assignment.problems.find(
      p => p._id?.toString() === submission.problemId.toString()
    );
    if (!problem) {
      throw new Error('Problem not found in assignment');
    }

    // Package all the relevant information
    const analysisData: RelevantPreGradingInformation = {
      question: problem.question,
      referenceSolution: problem.referenceSolution,
      rubric: problem.rubric.items,
      studentResponse: submission.answer
    };

    return analysisData;

  } catch (error) {
    console.error('Error in analyzeProblemSubmission:', error);
    throw new Error(`Failed to analyze submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}