// src/api-client/endpoints/submissions.ts
import apiClient from '../base';
import { ISubmission } from '@/models/Submission';
import { Types } from 'mongoose';

interface ApiError {
  error: string;
  details?: string;
}

interface SubmissionApiResponse {
  data: ISubmission | null;
  error?: ApiError;
}

interface SubmissionsApiResponse {
  data: ISubmission[] | null;
  error?: ApiError;
}

export const submissionApi = {
  /**
   * Gets a submission by its ID
   * @param submissionId - The MongoDB ObjectId of the submission
   * @returns Object containing either the submission data or error message
   * @example
   * const { data, error } = await submissionApi.getSubmissionById('507f1f77bcf86cd799439011');
   */
  getSubmissionById: async (submissionId: string): Promise<SubmissionApiResponse> => {
    try {
      const data = await apiClient.get<any, ISubmission>(`/submissions/${submissionId}`);
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to fetch submission' }
      };
    }
  },

  /**
   * Creates a new submission or updates an existing one
   * @param submissionData - The submission data including assignmentId, problemId, studentId, and answer
   * @returns Object containing either the created/updated submission or error message
   * @example
   * const { data, error } = await submissionApi.upsertSubmission({
   *   assignmentId: '507f1f77bcf86cd799439011',
   *   problemId: '507f1f77bcf86cd799439012',
   *   studentId: '507f1f77bcf86cd799439013',
   *   answer: 'My answer...'
   * });
   */
  upsertSubmission: async (submissionData: {
    assignmentId: string | Types.ObjectId;
    problemId: string | Types.ObjectId;
    studentId: string | Types.ObjectId;
    answer?: string;
    graded?: boolean;
    gradedBy?: string | Types.ObjectId;
    appliedRubricItems?: (string | Types.ObjectId)[];
    feedback?: string;
    selfGraded?: boolean;
    selfGradedAppliedRubricItems?: (string | Types.ObjectId)[];
  }): Promise<SubmissionApiResponse> => {
    try {
      const data = await apiClient.post<any, ISubmission>('/submissions', submissionData);
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to create/update submission' }
      };
    }
  },

  /**
   * Gets all submissions for a specific student
   * @param studentId - The MongoDB ObjectId of the student
   * @returns Object containing either an array of submissions or error message
   * @example
   * const { data, error } = await submissionApi.getSubmissionsByStudent('507f1f77bcf86cd799439011');
   */
  getSubmissionsByStudent: async (studentId: string): Promise<SubmissionsApiResponse> => {
    try {
      const data = await apiClient.get<any, ISubmission[]>(`/submissions/student/${studentId}`);
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to fetch student submissions' }
      };
    }
  },

  /**
   * Gets all submissions for a specific assignment
   * @param assignmentId - The MongoDB ObjectId of the assignment
   * @returns Object containing either an array of submissions or error message
   * @example
   * const { data, error } = await submissionApi.getSubmissionsByAssignment('507f1f77bcf86cd799439011');
   */
  getSubmissionsByAssignment: async (assignmentId: string): Promise<SubmissionsApiResponse> => {
    try {
      const data = await apiClient.get<any, ISubmission[]>(`/submissions/assignment/${assignmentId}`);
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to fetch assignment submissions' }
      };
    }
  },

  /**
   * Gets all submissions for a specific problem
   * @param problemId - The MongoDB ObjectId of the problem
   * @returns Object containing either an array of submissions or error message
   * @example
   * const { data, error } = await submissionApi.getSubmissionsByProblem('507f1f77bcf86cd799439011');
   */
  getSubmissionsByProblem: async (problemId: string): Promise<SubmissionsApiResponse> => {
    try {
      const data = await apiClient.get<any, ISubmission[]>(`/submissions/problem/${problemId}`);
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to fetch problem submissions' }
      };
    }
  },

  /**
   * Updates the grading for a submission
   * @param submissionId - The MongoDB ObjectId of the submission
   * @param gradingData - The grading data including gradedBy, appliedRubricItems, and optional feedback
   * @returns Object containing either the updated submission or error message
   * @example
   * const { data, error } = await submissionApi.updateGrading('507f1f77bcf86cd799439011', {
   *   gradedBy: '507f1f77bcf86cd799439012',
   *   appliedRubricItems: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
   *   feedback: 'Good work!'
   * });
   */
  updateGrading: async (
    submissionId: string,
    gradingData: {
      gradedBy: string | Types.ObjectId;
      appliedRubricItems: (string | Types.ObjectId)[];
      feedback?: string;
    }
  ): Promise<SubmissionApiResponse> => {
    try {
      const data = await apiClient.patch<any, ISubmission>(
        `/submissions/${submissionId}/grade`,
        gradingData
      );

      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to update submission grading' }
      };
    }
  },

  /**
   * Updates the self-grading for a submission
   * @param submissionId - The MongoDB ObjectId of the submission
   * @param selfGradedAppliedRubricItems - Array of rubric item IDs applied in self-grading
   * @returns Object containing either the updated submission or error message
   * @example
   * const { data, error } = await submissionApi.updateSelfGrading(
   *   '507f1f77bcf86cd799439011',
   *   ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014']
   * );
   */
  updateSelfGrading: async (
    submissionId: string,
    selfGradedAppliedRubricItems: (string | Types.ObjectId)[]
  ): Promise<SubmissionApiResponse> => {
    try {
      const data = await apiClient.patch<any, ISubmission>(
        `/submissions/${submissionId}/self-grade`,
        { selfGradedAppliedRubricItems }
      );
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to update submission self-grading' }
      };
    }
  }
};