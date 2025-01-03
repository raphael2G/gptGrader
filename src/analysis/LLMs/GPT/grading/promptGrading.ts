import { IRubricItem } from '@/models/Assignment';
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";



interface GradingInformation {
  question: string;
  referenceSolution: string;
  rubric: IRubricItem[];
  studentResponse: string;
}


export function buildGradingAnalysisPrompt({
  question,
  referenceSolution,
  rubric,
  studentResponse
}: GradingInformation) {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are an expert teaching assistant helping to grade student submissions.
Your task is to analyze student submissions based on provided rubrics and generate structured feedback.
Provide specific, actionable feedback that helps students understand both their strengths and areas for improvement.`
    },
    {
      role: "user",
      content: `Please analyze this student submission:

QUESTION:
${question}

REFERENCE SOLUTION:
${referenceSolution}

RUBRIC ITEMS:
${rubric.map((item) => 
  `ID: ${item._id}
Description: ${item.description}
Points: ${item.points}`
).join('\n\n')}

STUDENT'S SUBMISSION:
${studentResponse}

Analyze this submission according to each rubric item and provide structured feedback.
Be specific and constructive in your feedback. Focus on both what the student did well and what they could improve.`
    }
  ];

  return { messages };
}