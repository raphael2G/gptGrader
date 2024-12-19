// src/api-client/endpoints/assignments.ts
import apiClient from '../base';
import { IAssignment, IProblem, IRubricItem } from '@/models/Assignment';

interface ApiError {
  error: string;
  details?: string;
}

interface AssignmentApiResponse {
  data: IAssignment | null;
  error?: ApiError;
}

export const assignmentApi = {


  /**
 * Gets an assignment by ID
 */
  getAssignmentById: async (assignmentId: string): Promise<AssignmentApiResponse> => {
    try {
      const data = await apiClient.get<any, IAssignment>(`/assignments/${assignmentId}`);
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to fetch assignment' }
      };
    }
  },


  /**
   * Creates a new assignment
   */
  create: async (
    courseId: string,
    assignmentData: Omit<IAssignment, '_id' | 'courseId' | 'createdAt' | 'updatedAt'>
  ): Promise<AssignmentApiResponse> => {
    try {
      const data = await apiClient.post<any, IAssignment>('/assignments', {
        courseId,
        ...assignmentData
      });
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to create assignment' }
      };
    }
  },

  /**
   * Updates an assignment's basic details
   */
  update: async (
    assignmentId: string,
    updateData: Partial<Omit<IAssignment, '_id' | 'problems' | 'courseId' | 'createdAt' | 'updatedAt'>>
  ): Promise<AssignmentApiResponse> => {
    try {
      const data = await apiClient.patch<any, IAssignment>(`/assignments/${assignmentId}`, updateData);
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to update assignment' }
      };
    }
  },

  /**
   * Deletes an assignment
   */
  delete: async (assignmentId: string): Promise<AssignmentApiResponse> => {
    try {
      const data = await apiClient.delete<any, IAssignment>(`/assignments/${assignmentId}`);
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to delete assignment' }
      };
    }
  },

  /**
   * Adds or updates a problem in an assignment
   */
  upsertProblem: async (
    assignmentId: string,
    problemData: Partial<IProblem>
  ): Promise<AssignmentApiResponse> => {
    try {
      const data = await apiClient.post<any, IAssignment>(
        `/assignments/${assignmentId}/problems`,
        problemData
      );
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to upsert problem' }
      };
    }
  },

  /**
   * Deletes a problem from an assignment
   */
  deleteProblem: async (
    assignmentId: string,
    problemId: string
  ): Promise<AssignmentApiResponse> => {
    try {
      const data = await apiClient.delete<any, IAssignment>(
        `/assignments/${assignmentId}/problems/${problemId}`
      );
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to delete problem' }
      };
    }
  },

  /**
   * Adds or updates a rubric item
   */
  upsertRubricItem: async (
    assignmentId: string,
    problemId: string,
    rubricItemData: Partial<IRubricItem>
  ): Promise<AssignmentApiResponse> => {
    try {
      const data = await apiClient.post<any, IAssignment>(
        `/assignments/${assignmentId}/rubric-items`,
        {
          problemId,
          ...rubricItemData
        }
      );
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to upsert rubric item' }
      };
    }
  },

  /**
   * Deletes a rubric item
   */
  deleteRubricItem: async (
    assignmentId: string,
    problemId: string,
    itemId: string
  ): Promise<AssignmentApiResponse> => {
    try {
      const data = await apiClient.delete<any, IAssignment>(
        `/assignments/${assignmentId}/rubric-items/${itemId}`,
        {
          data: { problemId } // Send in request body for DELETE
        }
      );
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to delete rubric item' }
      };
    }
  }
};