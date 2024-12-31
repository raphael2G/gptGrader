// src/api-client/endpoints/users.ts
import apiClient from '../base';
import { IUser } from '@/models/User';
import { ICourse } from '@/models/Course'

interface ApiError {
  error: string;
  details?: string;
}

interface UserApiResponse {
  data: IUser | null;
  error?: ApiError;
}

interface UserCoursesApiResponse {
  data: ICourse[] | null;
  error?: ApiError;
}


export const userApi = {

 /**
 * Fetches a user by their ID
 * @param userid - The ID of the user to fetch
 * @returns Promise containing either the course data or error message
 * @throws Will throw an error if the course does not exist or there is a server issue
 * @example
 * const { data, error } = await courseApi.getCourseById("507f1f77bcf86cd799439011");
 */
  getUserById: async (userId: string): Promise<UserApiResponse> => {
    try {
      const data = await apiClient.get<any, IUser>(`/users/${userId}`);
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to fetch user' }
      };
    }
  },
  



  /**
   * Creates a new user or returns existing user if found
   * @param firebaseUid - The user's Firebase UID from authentication
   * @param email - User's email address (must be @andrew.cmu.edu)
   * @param name - Optional user's display name
   * @returns Object containing either the user data or error message
   * @example
   * const { data, error } = await userApi.create('firebase123', 'student@andrew.cmu.edu', 'John Doe');
   */
  create: async (
    firebaseUid: string,
    email: string,
    name?: string
  ): Promise<UserApiResponse> => {
    try {
      const data = await apiClient.post<any, IUser>('/users', {
        firebaseUid,
        email,
        name
      });
      return { data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to create user' }
      };
    }
  },

  /**
   * Fetches enrolled courses for a user
   * @param userId - The MongoDB ObjectId of the user
   * @returns Object containing either the courses data or error message
   * @example
   * const { data, error } = await userApi.getEnrolledCourses('507f1f77bcf86cd799439011');
   */
  getEnrolledCourses: async (userId: string):Promise<UserCoursesApiResponse> => {
    try {
      const response = await apiClient.get(`/users/${userId}/courses?type=enrolled`);
      return { data: response.data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to fetch enrolled courses' }
      };
    }
  },

  /**
   * Fetches enrolled courses for a user
   * @param userId - The MongoDB ObjectId of the user
   * @returns Object containing either the courses data or error message
   * @example
   * const { data, error } = await userApi.getEnrolledCourses('507f1f77bcf86cd799439011');
   */
  getInstructingCourses: async (userId: string):Promise<UserCoursesApiResponse> => {
    try {
      const response = await apiClient.get(`/users/${userId}/courses?type=teaching`);
      return { data: response.data, error: undefined };
    } catch (err) {
      const error = err as { response?: { data: ApiError } };
      return {
        data: null,
        error: error.response?.data || { error: 'Failed to fetch instructing courses' }
      };
    }
  }

  
};