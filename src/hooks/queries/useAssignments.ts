// hooks/queries/useAssignments.ts
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { getQueryConfig } from './config';
import { assignmentApi } from '@/api-client/endpoints/assignments';
import { IAssignment } from '@/models/Assignment';

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