// src/api-client/endpoints/courses.ts
import apiClient from '../base';
import { ICourse } from '@/models/Course';

interface ApiError {
  error: string;
  details?: string;
}

interface CourseApiResponse {
  data: ICourse | null;
  error?: ApiError;
}

export const courseApi = {

  /**
 * Fetches a course by its ID
 * @param courseId - The ID of the course to fetch
 * @returns Promise containing either the course data or error message
 * @throws Will throw an error if the course does not exist or there is a server issue
 * @example
 * const { data, error } = await courseApi.getCourseById("507f1f77bcf86cd799439011");
 */
  getCourseById: async (courseId: string): Promise<CourseApiResponse> => {
    try {
      const data = await apiClient.get<any, ICourse>(`/courses/${courseId}`);
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to fetch course' }
      };
    }
  },

  /**
   * Creates a new course and automatically adds the creator as an instructor
   * @param courseData - The course information
   * @param courseData.title - The title of the course
   * @param courseData.courseCode - Unique identifier for the course (e.g., "15-445")
   * @param courseData.description - Course description
   * @param courseData.instructor - Name of the primary instructor
   * @param courseData.semester - Optional: "Fall" | "Spring" | "Summer"
   * @param courseData.year - Optional: Academic year
   * @param creatorId - MongoDB _id of the user creating the course
   * @returns Promise containing either the created course data or error message
   * @throws Will throw an error if courseCode already exists
   * @example
   * const { data, error } = await courseApi.create({
   *   title: "Database Systems",
   *   courseCode: "15-445",
   *   description: "Learn about database management systems",
   *   instructor: "Dr. Smith",
   *   semester: "Fall",
   *   year: 2024
   * }, "507f1f77bcf86cd799439011");
   */
  createCourse: async (
    courseData: {
      title: string;
      courseCode: string;
      description: string;
      instructor: string;
      semester?: string;
      year?: number;
    },
    creatorId: string
  ): Promise<CourseApiResponse> => {
    try {
      const data = await apiClient.post<any, ICourse>('/courses', {
        ...courseData,
        creatorId
      });
      return { data, error: undefined };


    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to create course' }
      };
    }
  },

  /**
   * Deletes a course and all associated data (assignments, submissions, etc.)
   * @param courseId - MongoDB _id of the course to delete
   * @returns Promise containing either the deleted course data or error message
   * @throws Will throw an error if course doesn't exist or user lacks permission
   * @example
   * const { data, error } = await courseApi.delete("507f1f77bcf86cd799439011");
   */
  delete: async (courseId: string): Promise<CourseApiResponse> => {
    try {
      const data = await apiClient.delete<any, ICourse>(`/courses/${courseId}`);
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to delete course' }
      };
    }
  },


  /**
   * Adds a student to a course
   * @param courseId - The ID of the course
   * @param studentId - The ID of the student to add
   * @returns Updated course data or error
   */
  addStudent: async (
    courseId: string,
    studentId: string
  ): Promise<CourseApiResponse> => {
    try {
      const data = await apiClient.post<any, ICourse>(`/courses/${courseId}/students`, {
        studentId
      });
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to add student to course' }
      };
    }
  }, 


  /**
   * Joins a course using a course code
   * @param courseCode - The unique code for the course
   * @param studentId - The MongoDB _id of the student
   * @returns Updated course data or error
   */
  joinCourseByCode: async (
    courseCode: string,
    studentId: string
  ): Promise<CourseApiResponse> => {
    try {
      // Updated path to match new route location
      const data = await apiClient.post<any, ICourse>('/courses/join', {
        courseCode,
        studentId
      });
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to join course' }
      };
    }
  }


};