// hooks/queries/useUser.ts
import { useQuery } from '@tanstack/react-query';
import { getQueryConfig } from './config';
import { queryKeys } from './queryKeys';

import { userApi } from '@/api-client/endpoints/users';
import { ICourse } from '@/models/Course';

/**
 * React Query hook for fetching enrolled courses for a user
 * 
 * @param userId - The ID of the user whose enrolled courses to fetch
 * 
 * @returns UseQueryResult containing:
 * - `data`: Array of courses the user is enrolled in
 * - `isLoading`: Boolean indicating if the query is loading
 * - `error`: Any error that occurred during the query
 * - Additional React Query states and functions
 * 
 * @example
 * ```tsx
 * const { data: courses, isLoading } = useEnrolledCourses(userId);
 * 
 * if (isLoading) return <div>Loading...</div>;
 * 
 * return (
 *   <div>
 *     {courses?.map(course => (
 *       <CourseCard key={course._id} course={course} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useEnrolledCourses(userId: string, options?: any) {
  return useQuery<ICourse[], Error>({
    queryKey: queryKeys.userKeys.lists.enrolledCourses(userId),
    queryFn: async () => {
      const response = await userApi.getEnrolledCourses(userId);
      if (!response.data) {
        throw new Error('Failed to fetch enrolled courses');
      }
      return response.data;
    },
    ...getQueryConfig('getEnrolledCourses', options)
  });
}

/** React Query hook for fetching enrolled courses for a user
 * 
 * @param userId - The ID of the user whose teaching courses to fetch
 * 
 * @returns UseQueryResult containing:
 * - `data`: Array of courses the user is teaching
 * - `isLoading`: Boolean indicating if the query is loading
 * - `error`: Any error that occurred during the query
 * - Additional React Query states and functions
 */
export function useInstructingCourses(userId: string, options?: any) {
  return useQuery<ICourse[], Error>({
    queryKey: queryKeys.userKeys.lists.instructingCourses(userId),
    queryFn: async () => {
      const response = await userApi.getInstructingCourses(userId);
      if (!response.data) {
        throw new Error('Failed to fetch enrolled courses');
      }
      return response.data;
    },
    ...getQueryConfig('getEnrolledCourses', options)
  });
}

