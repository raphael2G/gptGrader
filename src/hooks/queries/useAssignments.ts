// hooks/queries/useAssignments.ts
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { getQueryConfig } from './config';
import { assignmentApi } from '@/api-client/endpoints/assignments';
import { IAssignment, IProblem, IRubricItem } from '@/models/Assignment';
import { Types } from 'mongoose';

interface CreateAssignmentParams {
  courseId: string;
  assignmentData: Omit<IAssignment, '_id' | 'courseId' | 'createdAt' | 'updatedAt'>;
}

/**
 * React Query mutation hook for creating a new assignment
 * 
 * @returns UseMutationResult for creating an assignment
 * 
 * @example
 * ```tsx
 * const { mutate: createAssignment, isLoading } = useCreateAssignment();
 * 
 * const handleCreate = () => {
 *   createAssignment(
 *     { 
 *       courseId: 'course123', 
 *       assignmentData: {
 *         title: 'New Assignment',
 *         description: 'Description...',
 *         dueDate: new Date(),
 *         problems: []
 *       }
 *     },
 *     {
 *       onSuccess: () => {
 *         toast.success('Assignment created successfully');
 *       },
 *       onError: (error) => {
 *         toast.error(error.message);
 *       }
 *     }
 *   );
 * };
 * ```
 */
export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation<IAssignment, Error, CreateAssignmentParams>({
    mutationFn: async ({ courseId, assignmentData }) => {
      const response = await assignmentApi.create(courseId, assignmentData);
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to create assignment');
      }
      return response.data;
    },
    onSuccess: (data, { courseId }) => {
      // Invalidate the course's assignment list
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignmentKeys.lists.byCourse(courseId)
      });

      // invalidate course itself
      queryClient.invalidateQueries({
        queryKey: queryKeys.courseKeys.item(courseId)
      })
      
      // Also update the individual assignment cache 
      queryClient.setQueryData(
        queryKeys.assignmentKeys.item(data._id.toString()),
        data
      );
    }
  });
}

/**
 * React Query hook for fetching an assignment by ID
 * 
 * @param assignmentId - The ID of the assignment to fetch
 * @param options - Optional React Query configuration overrides
 * 
 * @returns UseQueryResult containing:
 * - `data`: The assignment data if successful
 * - `isLoading`: Boolean indicating if the query is loading
 * - `error`: Any error that occurred during the query
 * - Additional React Query states and functions
 * 
 * @example
 * ```tsx
 * const { data: assignment, isLoading } = useGetAssignmentById(assignmentId);
 * 
 * if (isLoading) return <div>Loading...</div>;
 * 
 * return (
 *   <div>
 *     <h1>{assignment.title}</h1>
 *     <p>{assignment.description}</p>
 *   </div>
 * );
 * ```
 */
export function useGetAssignmentById(assignmentId: string, options?: any) {
  return useQuery<IAssignment, Error>({
    queryKey: queryKeys.assignmentKeys.item(assignmentId),
    queryFn: async () => {
      const response = await assignmentApi.getAssignmentById(assignmentId);
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to fetch assignment');
      }
      return response.data;
    },
    ...getQueryConfig('getAssignmentById', options),
  });
}

export function useGetAssignmentsByArrayOfIds(assignmentIds: string[], options?: any) {
  // useQueries to run many queries in parallel
  const assignmentQueries = useQueries({
    queries: 
      assignmentIds.map((assignmentId) => ({
        queryKey: queryKeys.assignmentKeys.item(assignmentId),
        queryFn: async () => {
          const response = await assignmentApi.getAssignmentById(assignmentId);
          if (!response.data) {
            throw new Error(response.error?.error || 'Failed to fetch assignment');
          }
          return response.data;
        },
        ...getQueryConfig('getAssignmentById', options),
    })),
  });

  // assignmentQueries is now an array of query results
  // Each item in the array has its own loading state, error state, and data
  
  // isLoading is true if ANY of the queries are still loading
  const isLoading = assignmentQueries.some(query => query.isLoading);
  
  // error will be set to the first error encountered, if any
  const error = assignmentQueries.find(query => query.error)?.error;

  // Get just the assignment data from each successful query
  // Filter out any undefined results (failed queries)
  const assignments = assignmentQueries
    .map(query => query.data)
    .filter((assignment): assignment is IAssignment => assignment !== undefined);

  // Return a clean interface that hides the complexity
  return {
    assignments,  // Array of successfully fetched assignments
    isLoading,   // True if any assignments are still loading
    error,       // First error encountered, if any
    isError: !!error
  };
}

interface UpdateAssignmentParams {
  assignmentId: string;
  updateData: Partial<Omit<IAssignment, '_id' | 'problems' | 'courseId' | 'createdAt' | 'updatedAt'>>;
}

export function useUpdateAssignment() {
    const queryClient = useQueryClient();

    return useMutation<IAssignment, Error, UpdateAssignmentParams>({
      mutationFn: async ({ assignmentId, updateData }) => {
        const response = await assignmentApi.update(assignmentId, updateData);
        if (!response.data) {
          throw new Error(response.error?.error || 'Failed to create assignment');
        }
        return response.data;
      },
      onSuccess: (data, _) => {

        // Also update the individual assignment cache 
        queryClient.setQueryData(
          queryKeys.assignmentKeys.item(data._id.toString()),
          data
        );
        
        // invalidate the assignment itself
        queryClient.invalidateQueries({
          queryKey: queryKeys.assignmentKeys.item(data._id.toString())
        })

      }
    });
  }

interface UpsertProblemParams {
  assignmentId: string;
  problemData: Partial<IProblem>
}

export function useUpsertProblem() {
  const queryClient = useQueryClient();

  return useMutation<IProblem, Error, UpsertProblemParams>({
    mutationFn: async ({assignmentId, problemData}) => {
      const response = await assignmentApi.upsertProblem(assignmentId, problemData)
      if (!response.data) {
        throw new Error(response?.error?.details || "Failed to update problem")
      }
      return response.data
    }, 
    onSuccess: (data, {assignmentId}) => {
      // invalidate the assignment where this problem comes from
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignmentKeys.item(assignmentId)
      })
    }
  });
}

interface UpdateReferenceSolutionParams {
  assignmentId: string;
  problemId: string;
  referenceSolution: string;
}

interface UpdateReferenceSolutionParams {
  assignmentId: string;
  problemId: string;
  referenceSolution: string;
}

export function useUpdateProblemReferenceSolution() {
  const queryClient = useQueryClient();

  return useMutation<IAssignment, Error, UpdateReferenceSolutionParams>({
    mutationFn: async ({ assignmentId, problemId, referenceSolution }) => {
      const response = await assignmentApi.updateProblemReferenceSolution(
        assignmentId,
        problemId,
        referenceSolution
      );

      console.log("it has to be the hook? this is the response")
      console.log(response)

      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to update reference solution');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate the assignment query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignmentKeys.item(data._id.toString())
      });
    }
  });
}

// Add this to useAssignments.ts

interface FinalizeProblemRubricParams {
  assignmentId: string;
  problemId: string;
}

/**
 * React Query mutation hook for finalizing a problem's rubric
 * 
 * @returns UseMutationResult for finalizing a problem's rubric
 * 
 * @example
 * ```tsx
 * const { mutate: finalizeProblemRubric, isPending } = useFinalizeProblemRubric();
 * 
 * const handleFinalize = () => {
 *   finalizeProblemRubric(
 *     { assignmentId, problemId },
 *     {
 *       onSuccess: () => {
 *         toast.success('Rubric finalized!');
 *       }
 *     }
 *   );
 * };
 * ```
 */
export function useFinalizeProblemRubric() {
  const queryClient = useQueryClient();

  return useMutation<IProblem, Error, FinalizeProblemRubricParams>({
    mutationFn: async ({ assignmentId, problemId }) => {
      // First get the current assignment to access the problem data
      const assignmentResponse = await assignmentApi.getAssignmentById(assignmentId);
      if (!assignmentResponse.data) {
        throw new Error('Failed to fetch assignment data');
      }

      // Find the current problem
      const currentProblem = assignmentResponse.data.problems.find(
        p => p._id?.toString() === problemId
      );
      
      if (!currentProblem) {
        throw new Error('Problem not found');
      }

      // Update the problem with rubricFinalized = true while preserving other fields
      const response = await assignmentApi.upsertProblem(assignmentId, {
        ...currentProblem,
        _id: new Types.ObjectId(problemId),
        rubricFinalized: true
      });
      
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to finalize rubric');
      }
      
      return response.data;
    },
    onSuccess: (data, { assignmentId }) => {
      // Invalidate the assignment query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignmentKeys.item(assignmentId)
      });
    }
  });
}

interface DeleteProblemParams {
  assignmentId: string;
  problemId: string;
}
export function useDeleteProblem() {
  const queryClient = useQueryClient();

  return useMutation<IProblem, Error, DeleteProblemParams>({
    mutationFn: async ({assignmentId, problemId}) => {
      const response = await assignmentApi.deleteProblem(assignmentId, problemId)
      if (!response.data) {
        throw new Error (response?.error?.details || "Unable to delete problem.")
      }
      return response.data
    }, 
    onSuccess: (data, {assignmentId}) => {
      // invalidate the assignment problem is from
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignmentKeys.item(assignmentId)
      })
    }
  })
}

interface UpsertRubricItemParams {
  assignmentId: string;
  problemId: string;
  rubricItemData: Partial<IRubricItem>
}
export function useUpsertRubricItem() {
  const queryClient = useQueryClient();

  return useMutation<IRubricItem, Error, UpsertRubricItemParams>({
    mutationFn: async ({assignmentId, problemId, rubricItemData}) => {
      const response = await assignmentApi.upsertRubricItem(assignmentId, problemId, rubricItemData);
      if (!response.data) {
        throw new Error(response?.error?.details || "Unable to upsert rubric item")
      }
      return response.data
    }, 
    onSuccess: (data, {assignmentId}) => {
      // invalidate queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignmentKeys.item(assignmentId)
      })
    }
  })
}

interface DeleteRubricItemParams {
  assignmentId: string;
  problemId: string;
  itemId: string;
}
export function useDeleteRubricItem() {
  const queryClient = useQueryClient();

  return useMutation<IRubricItem, Error, DeleteRubricItemParams>({
    mutationFn: async ({assignmentId, problemId, itemId}) => {
      const response = await assignmentApi.deleteRubricItem(assignmentId, problemId, itemId);
      if (!response.data) {
        throw new Error(response?.error?.details || "Unable to delete rubric item")
      }
      return response.data
    }, 
    onSuccess: (data, variables) => {
      // invalidate queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignmentKeys.item(variables.assignmentId)
      })
    }
  })
}