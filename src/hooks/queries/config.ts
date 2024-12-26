// lib/query/config.ts

/**
 * Time constants in milliseconds
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const;

/**
 * Base configuration options for queries or mutations
 */
export interface CommonConfigOptions {
  staleTime?: number;
  cacheTime?: number;
  retry?: number | false;
  retryDelay?: number;
}


export interface QueryMutationConfig {
  queries: Record<string, CommonConfigOptions>;
  mutations: Record<string, CommonConfigOptions>;
}

/** 
 * Sets specific configurations for various queries and mutations
 * 
*/ 
export const configs: QueryMutationConfig = {
  queries: {
    getUserById: {
      staleTime: 10 * TIME.MINUTE,
      cacheTime: 30 * TIME.MINUTE,
      retry: 2,
    },
    getEnrolledCourses: {
      staleTime: 5 * TIME.MINUTE,
      cacheTime: TIME.HOUR,
      retry: 2,
    },
    getInstructingCourses: {
      staleTime: 5 * TIME.MINUTE,
      cacheTime: TIME.HOUR,
      retry: 2,
    },
    getCourseById: {
      staleTime: 15 * TIME.MINUTE,
      cacheTime: 2 * TIME.HOUR,
      retry: 3,
    },
  },
  mutations: {
    createCourse: {
      retry: 2,
      retryDelay: 1000,
    },
    updateCourse: {
      retry: 2,
      retryDelay: 1500,
    },
    deleteCourse: {
      retry: 2,
      retryDelay: 1000,
    },
  },
};

const DEFAULT_QUERY_CONFIG: CommonConfigOptions = {
  staleTime: 5 * TIME.MINUTE,
  cacheTime: 15 * TIME.MINUTE,
  retry: 1,
};

const DEFAULT_MUTATION_CONFIG: CommonConfigOptions = {
  retry: 1,
  retryDelay: 1000,
};


export type QueryFunction = keyof typeof configs.queries;
export type MutationFunction = keyof typeof configs.mutations;

/**
 * Retrieve a config for a given query key (with optional overrides).
 */
export function getQueryConfig(
  queryFn: string, // or `queryFn: QueryFunction` if you want strictness
  overrides?: Partial<CommonConfigOptions>
): CommonConfigOptions {
  const config = configs.queries[queryFn] ?? DEFAULT_QUERY_CONFIG;

  return {
    ...config,
    ...overrides,
  };
}

/**
 * Retrieve a config for a given mutation key (with optional overrides).
 */
export function getMutationConfig(
  mutationFn: string, // or `mutationFn: MutationFunction` if you want strictness
  overrides?: Partial<CommonConfigOptions>
): CommonConfigOptions {
  const config = configs.mutations[mutationFn] ?? DEFAULT_MUTATION_CONFIG;

  return {
    ...config,
    ...overrides,
  };
}
