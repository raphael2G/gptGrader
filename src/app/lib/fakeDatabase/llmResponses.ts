import { IRubricItem } from '@@/models/Assignment';

interface LLMAnalysisResult {
  commonCorrectThings: string[];
  commonMistakes: string[];
}

interface GeneratedRubricItem {
  description: string;
  points: number;
  id: string; // Added id to GeneratedRubricItem
}

interface GenerateRubricResponse {
  rubricItems: GeneratedRubricItem[];
}

interface AIGradingResult {
  appliedRubricItemIds: string[];
  feedback: string;
}

const llmResponses: Record<string, LLMAnalysisResult> = {
  'default': {
    commonCorrectThings: [
      'Correct use of variables',
      'Proper function structure',
      'Accurate mathematical operations'
    ],
    commonMistakes: [
      'Incorrect loop termination condition',
      'Misuse of comparison operators',
      'Forgetting to return a value from the function'
    ]
  }
};

export function getLLMResponse(problemId: string, referenceSolution: string): LLMAnalysisResult {
  // In a real implementation, this would use the problemId and referenceSolution
  // to generate a unique response. For now, we'll return the default response.
  return llmResponses['default'];
}

export function getGeneratedRubric(
  problemId: string,
  question: string,
  referenceSolution: string,
  commonCorrectThings: string[],
  commonMistakes: string[]
): GenerateRubricResponse {
  // In a real implementation, this would use all the parameters to generate a unique rubric.
  // For now, we'll create a mock rubric based on the common correct things and mistakes.
  const rubricItems: GeneratedRubricItem[] = [
    ...commonCorrectThings.map((item, index) => ({
      description: `Correctly ${item.toLowerCase()}`,
      points: 2,
      id: `item${index + 1}` // Added id to each rubric item
    })),
    ...commonMistakes.map((item, index) => ({
      description: `Avoided ${item.toLowerCase()}`,
      points: -1,
      id: `item${commonCorrectThings.length + index + 1}` // Added id to each rubric item
    }))
  ];

  return { rubricItems };
}

export function getAIGradingResult(problemId: string, studentAnswer: string, rubricItems: IRubricItem[]): AIGradingResult {
  // Randomly select a subset of rubric items
  const appliedRubricItemIds = rubricItems
    .filter(() => Math.random() > 0.5)
    .map(item => item.id);

  return {
    appliedRubricItemIds,
    feedback: "Good attempt! You've correctly implemented some parts of the solution, but there's room for improvement in others. Review the applied rubric items for specific feedback."
  };
}

