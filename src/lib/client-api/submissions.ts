import { submissions, getSubmissionsByStudentAndCourse, getSubmissionByAssignmentProblemAndStudent, getSubmissionsByAssignmentId, getSubmissionsByProblemId, getAdjacentSubmissionIds } from '../fakeDatabase/submissions'
import { getAssignmentsByCourseId } from '../fakeDatabase/assignments'
import { ISubmission } from '@/models/Submission'
import { StudentCourseStats, getStudentCourseStats } from '../services/studentStats'
import { simulateApiDelay } from '../utils/apiDelay'

interface ApiError {
  error: string
  details?: string
}

interface SubmissionApiResponse {
  data: ISubmission | null
  error?: ApiError
}

interface StudentStatsApiResponse {
  data: StudentCourseStats | null
  error?: ApiError
}

interface SubmissionsApiResponse {
  data: ISubmission[]
  error?: ApiError
}

export const submissionApi = {
  getSubmissionById: async (submissionId: string): Promise<SubmissionApiResponse> => {
    await simulateApiDelay();
    try {
      const submission = submissions.find(s => s._id === submissionId)
      if (submission) {
        return { data: submission }
      } else {
        return { data: null, error: { error: 'Submission not found' } }
      }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to fetch submission' }
      }
    }
  },

  createSubmission: async (
    assignmentId: string,
    studentId: string,
    answers: { problemId: string; answer: string }[]
  ): Promise<SubmissionApiResponse> => {
    await simulateApiDelay();
    try {
      const newSubmission: ISubmission = {
        _id: (submissions.length + 1).toString(),
        assignmentId,
        studentId,
        submittedAt: new Date(),
        answer: answers[0].answer, // Assuming one answer per submission
        problemId: answers[0].problemId,
        appliedRubricItemIds: [], // Initialize with empty array
        graded: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      submissions.push(newSubmission)
      return { data: newSubmission }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to create submission' }
      }
    }
  },

  getStudentCourseStats: async (courseId: string, studentId: string): Promise<StudentStatsApiResponse> => {
    await simulateApiDelay();
    try {
      const stats = await getStudentCourseStats(courseId, studentId);
      return { data: stats };
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to fetch student statistics' }
      }
    }
  },

  getStudentCompletionRate: async (courseId: string, studentId: string): Promise<{ data: number | null, error?: ApiError }> => {
    await simulateApiDelay();
    try {
      const stats = await getStudentCourseStats(courseId, studentId);
      return { data: stats ? stats.completionRate : null };
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to fetch student completion rate' }
      }
    }
  },

  getStudentPointsEarnedRate: async (courseId: string, studentId: string): Promise<{ data: number | null, error?: ApiError }> => {
    await simulateApiDelay();
    try {
      const stats = await getStudentCourseStats(courseId, studentId);
      return { data: stats ? stats.pointsEarnedRate : null };
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to fetch student points earned rate' }
      }
    }
  },
  getSubmissionsByStudentAndCourse: async (studentId: string, courseId: string): Promise<SubmissionsApiResponse> => {
    await simulateApiDelay();
    try {
      const studentSubmissions = getSubmissionsByStudentAndCourse(studentId, courseId)
      return { data: studentSubmissions }
    } catch (err) {
      return {
        data: [],
        error: { error: 'Failed to fetch student submissions' }
      }
    }
  },
  getSubmissionByAssignmentAndStudent: async (assignmentId: string, studentId: string): Promise<SubmissionApiResponse> => {
    await simulateApiDelay();
    try {
      const submission = submissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId);
      if (submission) {
        return { data: submission };
      } else {
        return { data: null, error: { error: 'Submission not found' } };
      }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to fetch submission' }
      };
    }
  },
  getSubmissionByAssignmentProblemAndStudent: async (assignmentId: string, problemId: string, studentId: string): Promise<SubmissionApiResponse> => {
    await simulateApiDelay();
    try {
      const submission = getSubmissionByAssignmentProblemAndStudent(assignmentId, problemId, studentId);
      if (submission) {
        return { data: submission };
      } else {
        return { data: null, error: { error: 'Submission not found' } };
      }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to fetch submission' }
      };
    }
  },
  getSubmissionsByAssignmentId: async (assignmentId: string): Promise<SubmissionsApiResponse> => {
    await simulateApiDelay();
    try {
      const assignmentSubmissions = getSubmissionsByAssignmentId(assignmentId)
      return { data: assignmentSubmissions }
    } catch (err) {
      return {
        data: [],
        error: { error: 'Failed to fetch submissions for assignment' }
      }
    }
  },
  getSubmissionsByProblemId: async (problemId: string): Promise<SubmissionsApiResponse> => {
    await simulateApiDelay();
    try {
      const problemSubmissions = getSubmissionsByProblemId(problemId);
      return { data: problemSubmissions };
    } catch (err) {
      return {
        data: [],
        error: { error: 'Failed to fetch submissions for problem' }
      };
    }
  },

  getAdjacentSubmissionIds: async (currentSubmissionId: string, problemId: string): Promise<{ data: { prevId: string | null, nextId: string | null } | null, error?: ApiError }> => {
    await simulateApiDelay();
    try {
      const adjacentIds = getAdjacentSubmissionIds(currentSubmissionId, problemId);
      return { data: adjacentIds };
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to fetch adjacent submission IDs' }
      };
    }
  },
}

export default submissionApi;

