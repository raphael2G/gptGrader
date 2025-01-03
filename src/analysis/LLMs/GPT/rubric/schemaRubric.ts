import { z } from 'zod';
import { IGenerateRubricResponse, IRubricItemImprovementResponse } from '@/analysis/interfaces/rubric';
import { VerifyExact } from '@/analysis/constants';

const isIntegerOrHalf = (value: number) => {
  return Number.isInteger(value) || (Math.abs(value * 2) % 1 === 0);
};

export const RubricItemSchema = z.object({
  rubric_item_criteria: z.string().describe(
      "Criteria for evaluating a student's response with respect to the question and reference solution. These criteria should be good ways of evaluating a students response with respect to the question and refernce solution"
    ),
  rubric_item_score: z
  .number()
  .refine(isIntegerOrHalf, {message: "Points must be integer or end in 0.5"})
  .describe(
      "The numerical value awarded or deducted for meeting this rubric item's criteria. Positive for correct aspects; negative for incorrect."
    )
})

export const GenerateRubricSchema = z.object({
  rubric: z.array(RubricItemSchema)
});


// verification that the zod matches our IGradingResponse
const _typeCheck: VerifyExact<IGenerateRubricResponse, z.infer<typeof GenerateRubricSchema>> = {} as any;
const __typeCheck: VerifyExact<IRubricItemImprovementResponse, z.infer<typeof RubricItemSchema>> = {} as any;


