import { simulateApiDelay } from '../utils/apiDelay'
import { getLLMResponse, getGeneratedRubric, getAIGradingResult } from '../fakeDatabase/llmResponses'
import { IRubricItem } from '@@/models/Assignment';

interface LLMAnalysisResult {
  commonCorrectThings: string[];
  commonMistakes: string[];
}

interface LLMApiResponse {
  data: LLMAnalysisResult | null;
  error?: { error: string };
}

interface GeneratedRubricItem {
  description: string;
  points: number;
}

interface GenerateRubricResponse {
  rubricItems: GeneratedRubricItem[];
}

interface AIGradingResult {
  appliedRubricItemIds: string[];
  feedback: string;
}

interface GradeAllSubmissionsResponse {
  success: boolean;
  message?: string;
}

export const llmApi = {
  analyzeSubmissions: async (
    problemId: string,
    referenceSolution: string
  ): Promise<LLMApiResponse> => {
    await simulateApiDelay();
    try {
      const result = getLLMResponse(problemId, referenceSolution);
      return { data: result };
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to analyze submissions' }
      };
    }
  },
  generateRubric: async (
    problemId: string,
    question: string,
    referenceSolution: string,
    commonCorrectThings: string[],
    commonMistakes: string[]
  ): Promise<{ data: GenerateRubricResponse | null; error?: { error: string } }> => {
    await simulateApiDelay();
    try {
      const result = getGeneratedRubric(problemId, question, referenceSolution, commonCorrectThings, commonMistakes);
      return { data: result };
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to generate rubric' }
      };
    }
  },
  gradeSubmission: async (
    problemId: string,
    studentAnswer: string,
    rubricItems: IRubricItem[]
  ): Promise<{ data: AIGradingResult | null; error?: { error: string } }> => {
    await simulateApiDelay();
    try {
      const result = getAIGradingResult(problemId, studentAnswer, rubricItems);
      return { data: result };
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to grade submission' }
      };
    }
  },
  gradeAllSubmissions: async (problemId: string): Promise<{ data: GradeAllSubmissionsResponse | null; error?: { error: string } }> => {
    await simulateApiDelay(); // Existing API delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ data: { success: true, message: 'All submissions graded successfully!' } });
      }, 10000); // 10-second delay
    });
  }
};

