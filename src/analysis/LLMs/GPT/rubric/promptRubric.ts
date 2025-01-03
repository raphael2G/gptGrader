import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

interface RubricCreationInformation {
  question: string;
  referenceSolution: string;
  additionalContext?: string; // Optional field for additional professor-provided context
}

export function buildRubricCreationPrompt({
  question,
  referenceSolution,
  additionalContext,
}: RubricCreationInformation) {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are an expert teaching assistant specializing in creating rubrics for student assignments.
Your task is to generate a detailed, structured rubric for evaluating student submissions.
Each rubric item should have a clear description, specify criteria for evaluation, and include an associated point value (positive or negative).
Point values can be integers or end in 0.5. Positive points indicate correct aspects, and negative points indicate incorrect aspects.`
    },
    {
      role: "user",
      content: `Please generate a rubric for the following question and reference solution:

QUESTION:
${question}

REFERENCE SOLUTION:
${referenceSolution}

${additionalContext ? `ADDITIONAL CONTEXT:\n${additionalContext}\n` : ''}

Each rubric item should:
- Include a clear and specific description of the evaluation criteria.
- Specify the point value associated with the criteria.

Generate at least three rubric items, but feel free to include more if necessary to comprehensively evaluate the question.`
    }
  ];

  return { messages };
}
