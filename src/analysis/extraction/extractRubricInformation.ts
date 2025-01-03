import { Types } from "mongoose";
import { getAssignmentById } from "@/services/assignmentServices";

interface RelevantRubricInformation {
  question: string;
  referenceSolution: string;
  additionalContext?: string; // Optional field for any extra information
}

export async function extractRelevantRubricInformation(
  assignmentId: Types.ObjectId,
  problemId: Types.ObjectId,
  additionalContext?: string
): Promise<RelevantRubricInformation> {
  try {
    // Get the assignment containing the problem
    const assignment = await getAssignmentById(assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Find the specific problem within the assignment
    const problem = assignment.problems.find(
      (p) => p._id?.toString() === problemId.toString()
    );
    if (!problem) {
      throw new Error("Problem not found in assignment");
    }

    // Extract all the relevant information for rubric generation
    const rubricData: RelevantRubricInformation = {
      question: problem.question,
      referenceSolution: problem.referenceSolution,
      additionalContext: additionalContext, // Include any extra professor-supplied context
    };

    return rubricData;
  } catch (error) {
    console.error("Error in extractRelevantRubricInformation:", error);
    throw new Error(
      `Failed to extract rubric information: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
