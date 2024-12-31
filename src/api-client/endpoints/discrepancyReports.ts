// src/api-client/endpoints/discrepancyReports.ts
import apiClient from '../base';
import { IDiscrepancyReport } from '@/models/DiscrepancyReport';

interface ApiError {
  error: string;
  details?: string;
}

interface DiscrepancyApiResponse {
  data: IDiscrepancyReport | null;
  error?: ApiError;
}

interface DiscrepancyListApiResponse {
  data: IDiscrepancyReport[] | null;
  error?: ApiError;
}

interface CreateDiscrepancyData {
  submissionId: string;
  problemId: string;
  rubricItemId: string;
  studentId: string;
  courseId: string;
  assignmentId: string;
  wasOriginallyApplied: boolean;
  studentThinksShouldBeApplied: boolean;
  studentExplanation: string;
}

interface ResolveDiscrepancyData {
  shouldItemBeApplied: boolean;
  explanation: string;
  resolvedBy: string;
}

export const discrepancyReportsApi = {
  /**
   * Creates or updates a discrepancy report
   * @param data The discrepancy report data
   */
  createOrUpdateDiscrepancyReport: async (data: CreateDiscrepancyData): Promise<DiscrepancyApiResponse> => {
    try {
      const response = await apiClient.post<any, IDiscrepancyReport>(
        '/discrepancy-reports',
        data
      );
      return { data: response, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to create/update discrepancy report' }
      };
    }
  },

  /**
   * Gets a discrepancy report for a specific submission
   * @param submissionId The ID of the submission
   */
  getDiscrepancyReportBySubmissionId: async (submissionId: string): Promise<DiscrepancyApiResponse> => {
    try {
      const response = await apiClient.get<any, IDiscrepancyReport>(
        `/discrepancy-reports/submission/${submissionId}`
      );
      return { data: response, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to fetch discrepancy report' }
      };
    }
  },

  /**
   * Gets all discrepancy reports for an assignment
   * @param assignmentId The ID of the assignment
   */
  getDiscrepancyReportsByAssignmentId: async (assignmentId: string): Promise<DiscrepancyListApiResponse> => {
    try {
      const reports = await apiClient.get<any, IDiscrepancyReport[]>(
        `/discrepancy-reports/assignment/${assignmentId}`
      );
      return { data: reports, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to fetch assignment discrepancy reports' }
      };
    }
  },

  /**
   * Gets all discrepancy reports for a rubric item
   * @param rubricItemId The ID of the rubric item
   */
  getDiscrepancyReportByRubricItemId: async (rubricItemId: string): Promise<DiscrepancyListApiResponse> => {
    try {
      const response = await apiClient.get<any, IDiscrepancyReport[]>(
        `/discrepancy-reports/rubric-item/${rubricItemId}`
      );
      return { data: response, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to fetch rubric item discrepancy reports' }
      };
    }
  },

  /**
   * Resolves a specific discrepancy report item
   * @param submissionId The ID of the submission
   * @param rubricItemId The ID of the rubric item
   * @param resolutionData The resolution data
   */
  resolveDiscrepancy: async (
    submissionId: string,
    rubricItemId: string,
    resolutionData: ResolveDiscrepancyData
  ): Promise<DiscrepancyApiResponse> => {
    try {
      console.log(resolutionData)
      const response = await apiClient.patch<any, IDiscrepancyReport>(
        `/discrepancy-reports/submission/${submissionId}/resolve/${rubricItemId}`,
        resolutionData
      );
      return { data: response, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to resolve discrepancy report' }
      };
    }
  }
};