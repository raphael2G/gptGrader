// hooks/queries/useSubmissions.ts
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { getQueryConfig, getMutationConfig } from './config';
import { submissionApi } from '@/api-client/endpoints/submissions';
import { ISubmission } from '@/models/Submission';
import { IUser } from '@/models/User';
import { userApi } from '@/api-client/endpoints/users';


interface UpsertSubmissionParams {
  assignmentId: string;
  problemId: string;
  studentId: string;
  answer?: string;
  graded?: boolean;
  gradedBy?: string;
  appliedRubricItems?: string[];
  feedback?: string;
  selfGraded?: boolean;
  selfGradedAppliedRubricItems?: string[];
}

/**
 * React Query hook for fetching a submission by ID
 * 
 * @param submissionId - The ID of the submission to fetch
 * @returns UseQueryResult containing the submission data and status
 * 
 * @example
 * ```tsx
 * const { data: submission, isLoading } = useGetSubmissionById(submissionId);
 * if (isLoading) return <div>Loading...</div>;
 * return <div>{submission.answer}</div>;
 * ```
 */
export function useGetSubmissionById(submissionId: string, options?: any) {
  return useQuery<ISubmission, Error>({
    queryKey: queryKeys.submissionKeys.item(submissionId),
    queryFn: async () => {
      const response = await submissionApi.getSubmissionById(submissionId);
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to fetch submission');
      }
      return response.data;
    },
    ...getQueryConfig('getSubmissionById', options),
  });
}

/**
 * React Query hook for fetching submissions by student
 */
export function useGetSubmissionsByStudentId(studentId: string, options?: any) {
  return useQuery<ISubmission[], Error>({
    queryKey: queryKeys.submissionKeys.lists.byStudent(studentId),
    queryFn: async () => {
      const response = await submissionApi.getSubmissionsByStudent(studentId);
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to fetch student submissions');
      }
      return response.data;
    },
    ...getQueryConfig('getSubmissionsByStudent', options),
  });
}

/**
 * React Query hook for fetching submissions by assignment
 */
export function useGetSubmissionsByAssignmentId(assignmentId: string, options?: any) {
  return useQuery<ISubmission[], Error>({
    queryKey: queryKeys.submissionKeys.lists.byAssignment(assignmentId),
    queryFn: async () => {
      const response = await submissionApi.getSubmissionsByAssignment(assignmentId);
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to fetch assignment submissions');
      }
      return response.data;
    },
    ...getQueryConfig('getSubmissionsByAssignment', options),
  });
}

/**
 * React Query hook for fetching submissions by problem
 */
export function useGetSubmissionsByProblemId(problemId: string, options?: any) {
  return useQuery<ISubmission[], Error>({
    queryKey: queryKeys.submissionKeys.lists.byProblem(problemId),
    queryFn: async () => {
      const response = await submissionApi.getSubmissionsByProblem(problemId);
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to fetch problem submissions');
      }
      return response.data;
    },
    ...getQueryConfig('getSubmissionsByProblem', options),
  });
}

/**
 * React Query mutation hook for creating or updating a submission
 * 
 * @example
 * ```tsx
 * const { mutate: upsertSubmission } = useUpsertSubmission();
 * 
 * const handleSubmit = () => {
 *   upsertSubmission({
 *     assignmentId: 'assignment123',
 *     problemId: 'problem456',
 *     studentId: 'student789',
 *     answer: 'My answer'
 *   }, {
 *     onSuccess: () => {
 *       toast.success('Submission saved!');
 *     }
 *   });
 * };
 * ```
 */
export function useUpsertSubmission() {
  const queryClient = useQueryClient();

  return useMutation<ISubmission, Error, UpsertSubmissionParams>({
    mutationFn: async (submissionData) => {
      const response = await submissionApi.upsertSubmission(submissionData);
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to save submission');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissionKeys.item(data._id.toString())
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissionKeys.lists.byStudent(data.studentId.toString())
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissionKeys.lists.byAssignment(data.assignmentId.toString())
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissionKeys.lists.byProblem(data.problemId.toString())
      });
    },
    ...getMutationConfig('upsertSubmission')
  });
}

interface UpdateGradingParams {
  submissionId: string;
  gradingData: {
    gradedBy: string;
    appliedRubricItems: string[];
    feedback?: string;
  };
}

/**
 * React Query mutation hook for updating submission grading
 */
export function useUpdateSubmissionGrading() {
  const queryClient = useQueryClient();

  return useMutation<ISubmission, Error, UpdateGradingParams>({
    mutationFn: async ({ submissionId, gradingData }) => {
      const response = await submissionApi.updateGrading(submissionId, gradingData);
      
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to update grading');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate the specific submission and related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissionKeys.item(data._id.toString())
      });
      // We might also want to invalidate lists containing this submission
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissionKeys.lists.byStudent(data.studentId.toString())
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissionKeys.lists.byAssignment(data.assignmentId.toString())
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissionKeys.lists.byProblem(data.problemId.toString())
      });
    },
    ...getMutationConfig('updateSubmissionGrading')
  });
}

interface UpdateSelfGradingParams {
  submissionId: string;
  selfGradedAppliedRubricItems: string[];
}

/**
 * React Query mutation hook for updating submission self-grading
 */
export function useUpdateSubmissionSelfGrading() {
  const queryClient = useQueryClient();

  return useMutation<ISubmission, Error, UpdateSelfGradingParams>({
    mutationFn: async ({ submissionId, selfGradedAppliedRubricItems }) => {
      const response = await submissionApi.updateSelfGrading(
        submissionId,
        selfGradedAppliedRubricItems
      );
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to update self-grading');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate the specific submission and related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissionKeys.item(data._id.toString())
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissionKeys.lists.byStudent(data.studentId.toString())
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissionKeys.lists.byAssignment(data.assignmentId.toString())
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissionKeys.lists.byProblem(data.problemId.toString())
      });
    },
    ...getMutationConfig('updateSubmissionSelfGrading')
  });
}

// // // // // // ******** INTERSECTION QUERIES ******** \\ \\ \\ \\ \\ \\ 



/**
 * React Query hook for fetching submissions filtered by both student and assignment
 * 
 * @param studentId - The ID of the student
 * @param assignmentId - The ID of the assignment
 * @returns Object containing the filtered submissions and loading state
 * 
 * @example
 * ```tsx
 * const { data: submissions, isLoading } = useGetSubmissionsByStudentAndAssignment(
 *   studentId,
 *   assignmentId
 * );
 * if (isLoading) return <div>Loading...</div>;
 * return <SubmissionsList submissions={submissions} />;
 * ```
 */
export function useGetSubmissionsByStudentIdAndAssignmentId(
  studentId: string,
  assignmentId: string,
  options?: any
) {
  const studentQuery = useGetSubmissionsByStudentId(studentId, options);
  const assignmentQuery = useGetSubmissionsByAssignmentId(assignmentId, options);

  const data = !studentQuery.data || !assignmentQuery.data 
    ? undefined
    : studentQuery.data.length <= assignmentQuery.data.length
      ? studentQuery.data.filter(s => s.assignmentId.toString() === assignmentId)
      : assignmentQuery.data.filter(s => s.studentId.toString() === studentId);

  return {
    data,
    isLoading: studentQuery.isLoading || assignmentQuery.isLoading,
    error: studentQuery.error || assignmentQuery.error,
    status: (!studentQuery.data || !assignmentQuery.data) 
      ? 'loading'
      : studentQuery.error || assignmentQuery.error 
        ? 'error'
        : 'success'
  };
}

/**
 * React Query hook for fetching submissions filtered by both student and problem
 * 
 * @param studentId - The ID of the student
 * @param problemId - The ID of the problem
 * @returns Object containing the filtered submissions and loading state
 * 
 * @example
 * ```tsx
 * const { data: submissions, isLoading } = useGetSubmissionsByStudentAndProblem(
 *   studentId,
 *   problemId
 * );
 * ```
 */
export function useGetSubmissionsByStudentIdAndProblemId(
  studentId: string,
  problemId: string,
  options?: any
) {
  const studentQuery = useGetSubmissionsByStudentId(studentId, options);
  const problemQuery = useGetSubmissionsByProblemId(problemId, options);

  const data = !studentQuery.data || !problemQuery.data 
    ? undefined
    : studentQuery.data.length <= problemQuery.data.length
      ? studentQuery.data.filter(s => s.problemId.toString() === problemId)
      : problemQuery.data.filter(s => s.studentId.toString() === studentId);

  return {
    data,
    isLoading: studentQuery.isLoading || problemQuery.isLoading,
    error: studentQuery.error || problemQuery.error,
    status: (!studentQuery.data || !problemQuery.data)
      ? 'loading'
      : studentQuery.error || problemQuery.error
        ? 'error'
        : 'success'
  };
}

/**
 * React Query hook for fetching submissions filtered by both assignment and problem
 * 
 * @param assignmentId - The ID of the assignment
 * @param problemId - The ID of the problem
 * @returns Object containing the filtered submissions and loading state
 * 
 * @example
 * ```tsx
 * const { data: submissions, isLoading } = useGetSubmissionsByAssignmentAndProblem(
 *   assignmentId,
 *   problemId
 * );
 * ```
 */
export function useGetSubmissionsByAssignmentIdAndProblemId(
  assignmentId: string,
  problemId: string,
  options?: any
) {
  const assignmentQuery = useGetSubmissionsByAssignmentId(assignmentId, options);
  const problemQuery = useGetSubmissionsByProblemId(problemId, options);

  const data = !assignmentQuery.data || !problemQuery.data 
    ? undefined
    : assignmentQuery.data.length <= problemQuery.data.length
      ? assignmentQuery.data.filter(s => s.problemId.toString() === problemId)
      : problemQuery.data.filter(s => s.assignmentId.toString() === assignmentId);

  return {
    data,
    isLoading: assignmentQuery.isLoading || problemQuery.isLoading,
    error: assignmentQuery.error || problemQuery.error,
    status: (!assignmentQuery.data || !problemQuery.data)
      ? 'loading'
      : assignmentQuery.error || problemQuery.error
        ? 'error'
        : 'success'
  };
}

/**
 * React Query hook for fetching submissions filtered by student, assignment, and problem
 * 
 * @param studentId - The ID of the student
 * @param assignmentId - The ID of the assignment
 * @param problemId - The ID of the problem
 * @returns Object containing the filtered submissions and loading state
 * 
 * @example
 * ```tsx
 * const { data: submissions, isLoading } = useGetSubmissionsByStudentAssignmentAndProblem(
 *   studentId,
 *   assignmentId,
 *   problemId
 * );
 * if (isLoading) return <div>Loading...</div>;
 * return <SubmissionsList submissions={submissions} />;
 * ```
 */
export function useGetSubmissionsByStudentIdAssignmentIdAndProblemId(
  studentId: string,
  assignmentId: string,
  problemId: string,
  options?: any
) {
  const studentQuery = useGetSubmissionsByStudentId(studentId, options);
  const assignmentQuery = useGetSubmissionsByAssignmentId(assignmentId, options);
  const problemQuery = useGetSubmissionsByProblemId(problemId, options);

  const data = !studentQuery.data || !assignmentQuery.data || !problemQuery.data
    ? undefined
    : [studentQuery.data, assignmentQuery.data, problemQuery.data]
        // Sort arrays by length to start with smallest for better performance
        .sort((a, b) => a.length - b.length)[0]
        // Filter based on all three criteria
        .filter(s => 
          s.studentId.toString() === studentId &&
          s.assignmentId.toString() === assignmentId &&
          s.problemId.toString() === problemId
        );
  

  return {
    data: data ? data[0] : data,
    isLoading: studentQuery.isLoading || assignmentQuery.isLoading || problemQuery.isLoading,
    error: studentQuery.error || assignmentQuery.error || problemQuery.error,
    status: (!studentQuery.data || !assignmentQuery.data || !problemQuery.data)
      ? 'loading'
      : studentQuery.error || assignmentQuery.error || problemQuery.error
        ? 'error'
        : 'success'
  };
}


