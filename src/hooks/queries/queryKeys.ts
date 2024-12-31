// User Keys
const userKeys = {
  root: ['user'] as const,
  item: (userId: string) => [...userKeys.root, 'item', userId],
  lists: {
    enrolledCourses: (userId: string) => [...userKeys.root, 'courses', 'enrolled', userId] as const,
    instructingCourses: (userId: string) => [...userKeys.root, 'courses', 'instructing', userId] as const,
  }
} as const

// Course Keys
const courseKeys = {
  root: ['courses'] as const,
  item: (id: string) => [...courseKeys.root, 'item', id] as const,
} as const

const assignmentKeys = {
  root: ['assignments'] as const, 
  item: (assignmentId: string) => [...assignmentKeys.root, 'item', assignmentId] as const,
  lists: {
    byCourse: (courseId: string) => [...assignmentKeys.root, 'byCourseId', courseId] as const
  }
}

const discrepancyKeys = {
  root: ['discrepancyReports'] as const, 
  item: (discrepancyReportId: string) => [...discrepancyKeys.root, 'item', discrepancyReportId],
  lists: {
    bySubmission: (submissionId: string) => [...discrepancyKeys.root, 'bySubmissionId', submissionId] as const,
    byAssignment: (assignmentId: string) => [...discrepancyKeys.root, 'byAssignmentId', assignmentId] as const,
    byRubricItem: (rubricItemId: string) => [...discrepancyKeys.root, 'byRubricItemId', rubricItemId] as const
  }
} as const

// Based on read operations:
// - getSubmissionById
// - getSubmissionsByStudent
// - getSubmissionsByAssignment
// - getSubmissionsByProblem
const submissionKeys = {
  root: ['submissions'] as const,
  item: (id: string) => [...submissionKeys.root, 'item', id] as const,
  lists: {
    byStudent: (studentId: string) => [...submissionKeys.root, 'byStudentId', studentId] as const,
    byAssignment: (assignmentId: string) => [...submissionKeys.root, 'byAssignmentId', assignmentId] as const,
    byProblem: (problemId: string) => [...submissionKeys.root, 'byProblemId', problemId] as const,
  }, 
} as const






export const queryKeys = {
  userKeys, 
  courseKeys, 
  assignmentKeys, 
  submissionKeys,
  discrepancyKeys
}