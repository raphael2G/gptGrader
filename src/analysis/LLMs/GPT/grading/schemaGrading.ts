import { z } from 'zod';
import { IGradingResponse } from '@/analysis/interfaces/grading';
import { VerifyExact } from '@/analysis/constants';

export const RubricEvaluationSchema = z.object({
  rubric_evaluation: z.array(z.object({
    rubric_item_id: z.string().describe("The unique identifier for the rubric item."),
    meets_criteria_of_this_item_description: z.boolean().describe(
      "Indicates whether the student's response has met the criteria for this rubric item being applied or not."
    ),
    comments: z.string().describe("Detailed comments about this rubric item's evaluation.")
  })).describe("List of rubric items evaluated for this submission."),
  
  global_feedback: z.object({
    strengths: z.string().describe("Highlights positive aspects of the student's submission."),
    weaknesses: z.string().describe("Identifies areas needing improvement."),
    suggestions: z.string().describe("Actionable suggestions for improving the submission.")
  }).describe("Overall feedback on the submission.")
});


// verification that the zod matches our IGradingResponse
const _typeCheck: VerifyExact<IGradingResponse, z.infer<typeof RubricEvaluationSchema>> = {} as any;


