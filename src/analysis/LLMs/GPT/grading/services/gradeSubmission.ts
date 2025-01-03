import { Types } from 'mongoose';

import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { RubricEvaluationSchema } from '../schemaGrading';
import { IGradingResponse } from '@/analysis/interfaces/grading';

import { buildGradingAnalysisPrompt } from '../promptGrading';
import { extractRelevantGradingInformation } from '@/analysis/extraction/extractGradingInformation';

import { updateSubmissionGrading } from '@/services/submissionServices';

import { AI_GRADER_ID } from '@/analysis/constants';




export async function analyzeProblemSubmission(submissionId: Types.ObjectId): Promise<IGradingResponse> {
  try {
    const client = new OpenAI();

    // Get all the relevant information
    const gradingInfo = await extractRelevantGradingInformation(submissionId);

    // Build the prompt with structured output schema
    const { messages } = buildGradingAnalysisPrompt(gradingInfo);

    // Call OpenAI with Zod schema parsing
    const completion = await client.beta.chat.completions.parse({
      model:"gpt-4o-2024-08-06",
      messages: messages,
      response_format: zodResponseFormat(RubricEvaluationSchema, "grading_response"),
      temperature: 0.0, // Lower temperature for more consistent grading
    });

    const result = completion.choices[0].message.parsed as IGradingResponse

    // Null check and type guard
    if (!result?.rubric_evaluation || !result?.global_feedback) {
      throw new Error('Invalid response format from OpenAI');
    }

    const appliedRubricItems = 
      result?.rubric_evaluation
        .filter(i => i.meets_criteria_of_this_item_description && !!i.rubric_item_id)
        .map(i => new Types.ObjectId(i.rubric_item_id)) || []

    const feedback = [
      `Strengths: ${result?.global_feedback.strengths}`,
      `Weaknesses: ${result?.global_feedback.weaknesses}`,
      `Suggestions: ${result?.global_feedback.suggestions}`
    ].join('\n\n');


    // Directly update the submission with results
    await updateSubmissionGrading(submissionId, AI_GRADER_ID, appliedRubricItems, feedback);

    return result

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during submission analysis';
    throw new Error(`Failed to analyze submission: ${errorMessage}`);
  }
}
