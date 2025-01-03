import { Types } from "mongoose";

import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { GenerateRubricSchema } from "../schemaRubric";
import { IGenerateRubricResponse } from "@/analysis/interfaces/rubric";

import { extractRelevantRubricInformation } from "@/analysis/extraction/extractRubricInformation";
import { buildRubricCreationPrompt } from "../promptRubric";

import { updateRubricForProblem } from "@/services/assignmentServices";


export async function generateAndUpdateRubric(
  assignmentId: Types.ObjectId,
  problemId: Types.ObjectId,
  additionalContext?: string
): Promise<IGenerateRubricResponse> {
  try {
    const client = new OpenAI();

    // Extract relevant information for rubric generation
    const rubricInfo = await extractRelevantRubricInformation(
      assignmentId,
      problemId,
      additionalContext
    );

    // Build the prompt for rubric creation
    const { messages } = buildRubricCreationPrompt(rubricInfo);

    // Call OpenAI with Zod schema parsing
    const completion = await client.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: messages,
      response_format: zodResponseFormat(GenerateRubricSchema, "rubric_response"),
      temperature: 0.7, // Slightly higher for creativity in rubric generation
    });

    const result = completion.choices[0].message.parsed as IGenerateRubricResponse;

    // Null check and type guard
    if (!result?.rubric || result.rubric.length === 0) {
      throw new Error("Invalid response format from OpenAI or empty rubric.");
    }

    // Map the generated rubric to the format required by `updateRubricForProblem`
    const newRubric = result.rubric.map((item) => ({
      description: item.rubric_item_criteria, // Map criteria to description
      points: item.rubric_item_score,        // Map score to points
    }));

    // Update the problem's rubric
    await updateRubricForProblem(assignmentId, problemId, newRubric);

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error during rubric generation";
    throw new Error(`Failed to generate rubric: ${errorMessage}`);
  }
}
