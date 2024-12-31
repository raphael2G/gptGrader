// hooks/queries/useDiscrepancyReports.ts
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { getQueryConfig, getMutationConfig } from './config';
import { discrepancyReportsApi } from '@/api-client/endpoints/discrepancyReports';
import { IDiscrepancyReport } from '@/models/DiscrepancyReport';

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

/**
 * React Query hook for creating or updating a discrepancy report
 * 
 * @returns UseMutationResult for creating/updating a discrepancy report
 * 
 * @example
 * ```tsx
 * const { mutate: createDiscrepancy, isLoading } = useCreateOrUpdateDiscrepancyReport();
 * 
 * const handleSubmit = () => {
 *   createDiscrepancy(
 *     {
 *       submissionId: 'sub123',
 *       // ... other required fields
 *     },
 *     {
 *       onSuccess: () => {
 *         toast.success('Discrepancy report created');
 *       }
 *     }
 *   );
 * };
 * ```
 */
export function useCreateOrUpdateDiscrepancyReport() {
  const queryClient = useQueryClient();

  return useMutation<IDiscrepancyReport, Error, CreateDiscrepancyData>({
    mutationFn: async (data) => {
      const response = await discrepancyReportsApi.createOrUpdateDiscrepancyReport(data);
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to create/update discrepancy report');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.discrepancyKeys.item(data._id.toString())
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.discrepancyKeys.lists.bySubmission(data.submissionId.toString())
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.discrepancyKeys.lists.byAssignment(data.assignmentId.toString())
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.discrepancyKeys.lists.byRubricItem(variables.rubricItemId)
      });
      
    }
  });
}

/**
 * React Query hook for fetching a discrepancy report by submission ID
 */
export function useGetDiscrepancyReportBySubmissionId(submissionId: string, options?: any) {
  return useQuery<IDiscrepancyReport, Error>({
    queryKey: queryKeys.discrepancyKeys.lists.bySubmission(submissionId),
    queryFn: async () => {
      const response = await discrepancyReportsApi.getDiscrepancyReportBySubmissionId(submissionId);
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to fetch discrepancy report');
      }
      return response.data;
    },
    ...getQueryConfig('getDiscrepancyReportBySubmissionId', options),
  });
}

/**
 * React Query hook for fetching discrepancy reports by assignment ID
 */
export function useGetDiscrepancyReportsByAssignmentId(assignmentId: string, options?: any) {
  return useQuery<IDiscrepancyReport[]>({
    queryKey: queryKeys.discrepancyKeys.lists.byAssignment(assignmentId),
    queryFn: async () => {
      const response = await discrepancyReportsApi.getDiscrepancyReportsByAssignmentId(assignmentId);
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to fetch assignment discrepancy reports');
      }
      return response.data; 
    },
    ...getQueryConfig('getDiscrepancyReportsByAssignmentId', options),
  });
}

/**
 * React Query hook for fetching discrepancy reports by rubric item ID
 */
export function useGetDiscrepancyReportsByRubricItemId(rubricItemId: string, options?: any) {
  return useQuery<IDiscrepancyReport[], Error>({
    queryKey: queryKeys.discrepancyKeys.lists.byRubricItem(rubricItemId),
    queryFn: async () => {
      const response = await discrepancyReportsApi.getDiscrepancyReportByRubricItemId(rubricItemId);
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to fetch rubric item discrepancy reports');
      }
      return response.data;
    },
    ...getQueryConfig('getDiscrepancyReportsByRubricItemId', options),
  });
}

interface ResolveDiscrepancyParams {
  submissionId: string;
  rubricItemId: string;
  resolutionData: {
    shouldItemBeApplied: boolean;
    explanation: string;
    resolvedBy: string;
  };
}

/**
 * React Query hook for resolving a discrepancy report item
 */
export function useResolveDiscrepancyReport() {
  const queryClient = useQueryClient();

  return useMutation<IDiscrepancyReport, Error, ResolveDiscrepancyParams>({
    mutationFn: async ({ submissionId, rubricItemId, resolutionData }) => {
      const response = await discrepancyReportsApi.resolveDiscrepancy(
        submissionId,
        rubricItemId,
        resolutionData
      );
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to resolve discrepancy report');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.discrepancyKeys.item(data._id.toString())
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.discrepancyKeys.lists.byRubricItem(variables.rubricItemId)
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.discrepancyKeys.lists.bySubmission(data.submissionId.toString())
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.discrepancyKeys.lists.byAssignment(data.assignmentId.toString())
      });
    },
    ...getMutationConfig('resolveDiscrepancyReport')
  });
}

/**
 * React Query hook for fetching multiple discrepancy reports by their assignment IDs
 * 
 * @param assignmentIds - Array of assignment IDs to fetch discrepancy reports for
 * @returns Object containing the aggregated results of all queries
 */
export function useGetDiscrepancyReportsByArrayOfAssignmentIds(assignmentIds: string[], options?: any) {
  const discrepancyReportQueries = useQueries({
    queries: (assignmentIds || []).map((assignmentId) => ({
      queryKey: queryKeys.discrepancyKeys.lists.byAssignment(assignmentId),
      queryFn: async () => {
        const response = await discrepancyReportsApi.getDiscrepancyReportsByAssignmentId(assignmentId);
        if (!response.data) {
          throw new Error(response.error?.error || 'Failed to fetch discrepancy reports');
        }
        return response.data;
      },
      ...getQueryConfig('getDiscrepancyReportsByAssignmentId', options),
      enabled: assignmentIds?.length > 0 && !!assignmentId,
      retry: 1,
    }))
  });

  const isLoading = discrepancyReportQueries.some(query => query.isLoading);
  const error = discrepancyReportQueries.find(query => query.error)?.error;

  // Build a map of assignmentId -> IDiscrepancyReport[]
  const reportMap = discrepancyReportQueries.reduce((acc, query, index) => {
    // query.data will be an array of discrepancy reports (IDiscrepancyReport[]) if it exists
    if (query.data) {
      const assignmentId = assignmentIds[index];
      acc[assignmentId] = query.data;
    }
    return acc
  }, {} as Record<string, IDiscrepancyReport[]>);


  return {
    reports: reportMap,
    isLoading,
    error,
    isError: !!error,
  };
}