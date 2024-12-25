// src/api-client/base.ts

import axios from 'axios';

// Create base axios instance with common configuration
const apiClient = axios.create({
  baseURL: '/api', // Next.js API routes start with /api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle common error patterns
apiClient.interceptors.response.use(
  (response: any) => response.data,
  (error: any) => {
    // Enhance error handling
    const enhancedError = new Error(
      error.response?.data?.message || error.message || 'An error occurred'
    );
    return Promise.reject(enhancedError);
  }
);

export default apiClient;