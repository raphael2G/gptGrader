// hooks/queries/useCourse.ts
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { getQueryConfig, getMutationConfig } from './config';
import { courseApi } from '@/api-client/endpoints/courses';
import { ICourse } from '@/models/Course';


// hooks/queries/useCourse.ts

// First, let's define the parameters interface based on the courseApi.createCourse requirements
interface CreateCourseParams {
  courseData: {
    title: string;
    courseCode: string;
    description: string;
    instructor: string;
    semester?: string;
    year?: number;
  };
  creatorId: string;
}

/**
 * React Query mutation hook for creating a new course
 * 
 * @returns UseMutationResult containing:
 * - `mutate`: Function to call to create a course
 * - `isLoading`: Boolean indicating if the mutation is in progress
 * - `error`: Any error that occurred during the mutation
 * - Additional React Query mutation states and functions
 * 
 * The mutation will automatically invalidate the instructing courses query
 * for the creator, triggering a refresh of their course list.
 * 
 * @example
 * ```tsx
 * const { mutate: createCourse, isLoading } = useCreateCourse();
 * 
 * const handleCreateCourse = () => {
 *   createCourse(
 *     {
 *       courseData: {
 *         title: "Introduction to CS",
 *         courseCode: "CS101",
 *         description: "Learn programming basics",
 *         instructor: "Dr. Smith"
 *       },
 *       creatorId: currentUserId
 *     },
 *     {
 *       onSuccess: () => {
 *         toast.success('Course created successfully!');
 *       },
 *       onError: (error) => {
 *         toast.error(error.message);
 *       }
 *     }
 *   );
 * };
 * ```
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation<ICourse, Error, CreateCourseParams>({
    mutationFn: async ({ courseData, creatorId }) => {
      if (!creatorId) throw new Error("creatorId is null which is not allowed")
      const response = await courseApi.createCourse(courseData, creatorId);
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to create course');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userKeys.lists.instructingCourses(variables.creatorId)
      });
    },
    ...getMutationConfig('createCourse')
  });
}

interface JoinCourseParams {
  courseCode: string;
  studentId: string;
}

/**
 * React Query mutation hook for joining a course by course code
 * 
 * @returns UseMutationResult containing:
 * - `mutate`: Function to call to join a course
 * - `isLoading`: Boolean indicating if the mutation is in progress
 * - `error`: Any error that occurred during the mutation
 * - Additional React Query mutation states and functions
 * 
 * The mutation will automatically invalidate the enrolled courses query
 * for the student, triggering a refresh of their course list.
 * 
 * @example
 * ```tsx
 * const { mutate: joinCourse, isLoading } = useJoinCourseByCode();
 * 
 * const handleJoinCourse = () => {
 *   joinCourse(
 *     { courseCode: 'CS101', studentId: currentUserId },
 *     {
 *       onSuccess: () => {
 *         toast.success('Successfully joined course!');
 *       },
 *       onError: (error) => {
 *         toast.error(error.message);
 *       }
 *     }
 *   );
 * };
 * ```
 */
export function useJoinCourseByCode() {
  const queryClient = useQueryClient();

  return useMutation<ICourse, Error, JoinCourseParams>({
    mutationFn: async ({ courseCode, studentId }) => {
      const response = await courseApi.joinCourseByCode(courseCode, studentId);
      if (!response.data) {
        throw new Error('Failed to join course');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate enrolled courses query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.userKeys.lists.enrolledCourses(variables.studentId)
      });
    }
  });
}

export function useGetCourseById(courseId: string, options?: any) {

  return useQuery<ICourse, Error>({
    queryKey: queryKeys.courseKeys.item(courseId),
    queryFn: async () => {
      const response = await courseApi.getCourseById(courseId);
      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to fetch course data');
      }
      return response.data;
    },
    ...getQueryConfig('getCourseById', options),
  });
}

