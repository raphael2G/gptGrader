// src/api-client/endpoints/analyze.ts

import apiClient from '../base';
import { Types } from 'mongoose';
import { IGradingResponse, IBulkGradingProgress } from '@/analysis/interfaces/grading';
import { IGenerateRubricResponse } from '@/analysis/interfaces/rubric';


interface ApiError {
  error: string;
  details?: string;
}

interface AnalysisApiResponse {
  data: IGradingResponse | null;
  error?: ApiError;
}

interface GradeAllSubmissionsOptions {
  onProgress?: (progress: IBulkGradingProgress) => void;
  onError?: (error: Error) => void;
  onComplete?: (finalProgress: IBulkGradingProgress) => void;
}

interface GenerateRubricResponse {
  data: IGenerateRubricResponse | null;
  error?: ApiError;
}

export const analyzeApi = {
  /**
   * Analyzes a submission using AI to suggest rubric items and provide explanation
   * 
   * @param submissionId - The ID of the submission to analyze
   * @returns Promise containing either the analysis data or error message
   * 
   * @example
   * ```typescript
   * const { data, error } = await analyzeApi.submission("507f1f77bcf86cd799439011");
   * if (data) {
   *   const { recommendedRubricItems, explanation, confidence } = data;
   *   // Handle the analysis results
   * }
   * ```
   */
  gradeSubmission: async (submissionId: string): Promise<AnalysisApiResponse> => {
    try {
      const data = await apiClient.post<any, IGradingResponse>(
        `/analyze/submissions/grade/${submissionId}`
      );
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to analyze submission' }
      };
    }
  },

  /**
   * Initiates bulk grading of all submissions for a specific assignment problem
   * Returns an abort controller that can be used to cancel the operation
   */
  gradeAllSubmissions: (
    assignmentId: string,
    problemId: string,
    options?: GradeAllSubmissionsOptions
  ): AbortController => {
    const controller = new AbortController();

    fetch(`/api/analyze/submissions/grade/bulk/${assignmentId}/${problemId}`, {
      method: 'POST',
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to start grading process');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Parse the SSE data
          const text = new TextDecoder().decode(value);
          const messages = text.split('\n\n');

          for (const message of messages) {
            if (!message.startsWith('data: ')) continue;
            
            const data = JSON.parse(message.slice(6));

            if (data.error) {
              options?.onError?.(new Error(data.error));
              return;
            }

            if (data.complete) {
              options?.onComplete?.(data);
              return;
            }

            options?.onProgress?.(data);
          }
        }
      } catch (error) {
        options?.onError?.(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        reader.releaseLock();
      }
    }).catch((error) => {
      options?.onError?.(error);
    });

    return controller;
  },

  generateRubric: async (
    assignmentId: string,
    problemId: string,
    additionalContext?: string
  ): Promise<GenerateRubricResponse> => {
    try {
      // API call to generate the rubric
      const data = await apiClient.post<any, IGenerateRubricResponse>(
        `/analyze/rubrics/generate/${assignmentId}/${problemId}`,
        { additionalContext }
      );
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: "Failed to generate rubric" },
      };
    }
  }
  
};