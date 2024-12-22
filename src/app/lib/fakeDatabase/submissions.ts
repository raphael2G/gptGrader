import { ISubmission } from '@@/models/Submission'

// Helper function to create a fake ObjectId
const createObjectId = (): string => Math.random().toString(36).substring(2, 15)

// export interface ISubmission {
//   _id: string;
//   assignmentId: string;
//   problemId: string;
//   studentId: string;
//   answer: string;
//   submittedAt: Date;
//   graded: boolean;
//   gradedBy?: string;
//   gradedAt?: Date;
//   appliedRubricItemIds: string[];
//   createdAt: Date;
//   updatedAt: Date;
//   feedback?: string;
//   selfGradingStatus?: 'pending' | 'graded';
// }

export const submissions: ISubmission[] = [
  {
    _id: createObjectId(),
    assignmentId: 'assignment1',
    problemId: 'problem1',
    studentId: '1',
    answer: `def factorial(n):
  if n == 0:
      return 1
  else:
      return n * factorial(n-1)`,
    submittedAt: new Date('2023-09-14T10:00:00Z'),
    graded: true, // Graded
    gradedBy: '2',
    gradedAt: new Date('2023-09-16T14:00:00Z'),
    appliedRubricItemIds: ['rubric1', 'rubric2'], // Rubric items applied
    createdAt: new Date('2023-09-14T10:00:00Z'),
    updatedAt: new Date('2023-09-16T14:00:00Z'),
    feedback: "Good use of recursion, but be careful with the base case."
  },
  {
    _id: createObjectId(),
    assignmentId: 'assignment1',
    problemId: 'problem2',
    studentId: '1',
    answer: `even_numbers = [x for x in range(1, 21) if x % 2 == 0]
print(even_numbers)`,
    submittedAt: new Date('2023-09-14T11:00:00Z'),
    graded: false, // Not graded
    gradedBy: undefined,
    gradedAt: undefined,
    appliedRubricItemIds: [], // No rubric items applied
    createdAt: new Date('2023-09-14T11:00:00Z'),
    updatedAt: new Date('2023-09-16T15:00:00Z')
  },
  {
    _id: createObjectId(),
    assignmentId: 'assignment1',
    problemId: 'problem3',
    studentId: '1',
    answer: `def is_palindrome(s):
  s = s.lower()
  return s == s[::-1]

print(is_palindrome("A man a plan a canal Panama"))`,
    submittedAt: new Date('2023-09-14T12:00:00Z'),
    graded: false, // Not graded
    gradedBy: undefined,
    gradedAt: undefined,
    appliedRubricItemIds: [], // No rubric items applied
    createdAt: new Date('2023-09-14T12:00:00Z'),
    updatedAt: new Date('2023-09-16T16:00:00Z')
  },
  
  {
    _id: createObjectId(),
    assignmentId: 'assignment1',
    problemId: 'problem1',
    studentId: '3',
    answer: `def factorial(n):
  result = 1
  for i in range(1, n+1):
      result *= i
  return result`,
    submittedAt: new Date('2023-09-14T09:30:00Z'),
    graded: true,
    gradedBy: '2',
    gradedAt: new Date('2023-09-16T13:30:00Z'),
    appliedRubricItemIds: ['rubric1'],
    createdAt: new Date('2023-09-14T09:30:00Z'),
    updatedAt: new Date('2023-09-16T13:30:00Z'),
    feedback: "Good iterative solution, but consider using recursion as requested in the problem statement."
  },
  {
    _id: createObjectId(),
    assignmentId: 'assignment1',
    problemId: 'problem2',
    studentId: '3',
    answer: `even_numbers = []
for i in range(1, 21):
    if i % 2 == 0:
        even_numbers.append(i)
print(even_numbers)`,
    submittedAt: new Date('2023-09-14T10:15:00Z'),
    graded: false,
    gradedBy: '2',
    gradedAt: new Date('2023-09-16T14:15:00Z'),
    appliedRubricItemIds: ['rubric6', 'rubric7'],
    createdAt: new Date('2023-09-14T10:15:00Z'),
    updatedAt: new Date('2023-09-16T14:15:00Z'),
    feedback: "Correct logic, but try using a list comprehension for a more concise solution."
  },
  {
    _id: createObjectId(),
    assignmentId: 'assignment1',
    problemId: 'problem3',
    studentId: '3',
    answer: `def is_palindrome(s):
  s = ''.join(c.lower() for c in s if c.isalnum())
  return s == s[::-1]

print(is_palindrome("A man, a plan, a canal: Panama"))`,
    submittedAt: new Date('2023-09-14T11:00:00Z'),
    graded: true,
    gradedBy: '2',
    gradedAt: new Date('2023-09-16T15:00:00Z'),
    appliedRubricItemIds: ['rubric9', 'rubric10', 'rubric11'],
    createdAt: new Date('2023-09-14T11:00:00Z'),
    updatedAt: new Date('2023-09-16T15:00:00Z'),
    feedback: "Excellent solution! You've handled case sensitivity and non-alphanumeric characters well."
  },
  {
    _id: createObjectId(),
    assignmentId: 'assignment1',
    problemId: 'problem1',
    studentId: '4',
    answer: `def factorial(n):
  if n < 0:
      return None
  elif n == 0:
      return 1
  else:
      return n * factorial(n-1)`,
    submittedAt: new Date('2023-09-14T13:00:00Z'),
    graded: true,
    gradedBy: '2',
    gradedAt: new Date('2023-09-16T17:00:00Z'),
    appliedRubricItemIds: ['rubric1', 'rubric2'],
    createdAt: new Date('2023-09-14T13:00:00Z'),
    updatedAt: new Date('2023-09-16T17:00:00Z'),
    feedback: "Great job handling negative inputs! Your recursive solution is correct."
  },
  {
    _id: createObjectId(),
    assignmentId: 'assignment1',
    problemId: 'problem2',
    studentId: '4',
    answer: `even_numbers = list(range(2, 21, 2))
print(even_numbers)`,
    submittedAt: new Date('2023-09-14T14:00:00Z'),
    graded: false,
    gradedBy: '2',
    gradedAt: new Date('2023-09-16T18:00:00Z'),
    appliedRubricItemIds: ['rubric5', 'rubric6'],
    createdAt: new Date('2023-09-14T14:00:00Z'),
    updatedAt: new Date('2023-09-16T18:00:00Z'),
    feedback: "Clever use of the range function! However, try using a list comprehension as requested."
  },
  {
    _id: createObjectId(),
    assignmentId: 'assignment1',
    problemId: 'problem3',
    studentId: '4',
    answer: `def is_palindrome(s):
  return s.lower() == s.lower()[::-1]

print(is_palindrome("racecar"))
print(is_palindrome("hello"))`,
    submittedAt: new Date('2023-09-14T15:00:00Z'),
    graded: true,
    gradedBy: '2',
    gradedAt: new Date('2023-09-16T19:00:00Z'),
    appliedRubricItemIds: ['rubric9', 'rubric10', 'rubric11'],
    createdAt: new Date('2023-09-14T15:00:00Z'),
    updatedAt: new Date('2023-09-16T19:00:00Z'),
    feedback: "Good solution! Consider handling non-alphanumeric characters for more robust palindrome checking."
  },
  {
    _id: createObjectId(),
    assignmentId: 'assignment1',
    problemId: 'problem1',
    studentId: '5',
    answer: `def factorial(n):
  return 1 if n == 0 else n * factorial(n-1)`,
    submittedAt: new Date('2023-09-14T16:00:00Z'),
    graded: true,
    gradedBy: '2',
    gradedAt: new Date('2023-09-16T20:00:00Z'),
    appliedRubricItemIds: ['rubric1', 'rubric2'],
    createdAt: new Date('2023-09-14T16:00:00Z'),
    updatedAt: new Date('2023-09-16T20:00:00Z'),
    feedback: "Excellent use of a concise recursive solution!"
  },
  {
    _id: createObjectId(),
    assignmentId: 'assignment1',
    problemId: 'problem2',
    studentId: '5',
    answer: `print([x for x in range(1, 21) if x % 2 == 0])`,
    submittedAt: new Date('2023-09-14T17:00:00Z'),
    graded: false,
    gradedBy: '2',
    gradedAt: new Date('2023-09-16T21:00:00Z'),
    appliedRubricItemIds: ['rubric5', 'rubric6'],
    createdAt: new Date('2023-09-14T17:00:00Z'),
    updatedAt: new Date('2023-09-16T21:00:00Z'),
    feedback: "Perfect! You've used a list comprehension correctly and efficiently."
  },
  {
    _id: createObjectId(),
    assignmentId: 'assignment1',
    problemId: 'problem3',
    studentId: '5',
    answer: `import re

def is_palindrome(s):
    s = re.sub(r'[^a-zA-Z0-9]', '', s.lower())
    return s == s[::-1]

print(is_palindrome("A man, a plan, a canal: Panama"))
print(is_palindrome("race a car"))`,
    submittedAt: new Date('2023-09-14T18:00:00Z'),
    graded: true,
    gradedBy: '2',
    gradedAt: new Date('2023-09-16T22:00:00Z'),
    appliedRubricItemIds: ['rubric9', 'rubric10', 'rubric11'],
    createdAt: new Date('2023-09-14T18:00:00Z'),
    updatedAt: new Date('2023-09-16T22:00:00Z'),
    feedback: "Excellent solution! You've used regex to handle non-alphanumeric characters, which is a very efficient approach."
  },
  {
    _id: createObjectId(),
    assignmentId: 'assignment1',
    problemId: 'problem1',
    studentId: '6',
    answer: `def factorial(n):
    return 1 if n <= 1 else n * factorial(n-1)`,
    submittedAt: new Date('2023-09-14T19:00:00Z'),
    graded: true,
    appliedRubricItemIds: [],
    createdAt: new Date('2023-09-14T19:00:00Z'),
    updatedAt: new Date('2023-09-14T19:00:00Z'),
  },
  {
    _id: createObjectId(),
    assignmentId: 'assignment1',
    problemId: 'problem2',
    studentId: '6',
    answer: `even_numbers = [x for x in range(2, 21, 2)]`,
    submittedAt: new Date('2023-09-14T20:00:00Z'),
    graded: false,
    appliedRubricItemIds: [],
    createdAt: new Date('2023-09-14T20:00:00Z'),
    updatedAt: new Date('2023-09-14T20:00:00Z'),
  },
  {
    _id: createObjectId(),
    assignmentId: 'assignment1',
    problemId: 'problem3',
    studentId: '6',
    answer: `def is_palindrome(s):
    s = s.lower().replace(' ', '')
    return s == s[::-1]`,
    submittedAt: new Date('2023-09-14T21:00:00Z'),
    graded: false,
    appliedRubricItemIds: [],
    createdAt: new Date('2023-09-14T21:00:00Z'),
    updatedAt: new Date('2023-09-14T21:00:00Z'),
  },
  {
    _id: createObjectId(),
    assignmentId: 'assignment3', // Control Structures in Python
    problemId: 'problem1', // Question 1
    studentId: '1',
    answer: `def check_number(num):
  if num > 0:
    return "Positive"
  elif num < 0:
    return "Negative"
  else:
    return "Zero"`,
    submittedAt: new Date(),
    graded: false,
    appliedRubricItemIds: ['rubric3', 'rubric2', 'rubric1'],
    createdAt: new Date(),
    updatedAt: new Date(),
    selfGradingStatus: 'pending',
  },
  {
    _id: createObjectId(),
    assignmentId: 'assignment3', // Control Structures in Python
    problemId: 'problem2', // Question 2
    studentId: '1',
    answer: `def factorial(n):
  fact = 1
  for i in range(1, n + 1):
    fact *= i
  return fact`,
    submittedAt: new Date(),
    graded: false,
    appliedRubricItemIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    selfGradingStatus: 'pending',
  }
];

export const getSubmissionsByStudentAndCourse = (studentId: string, courseId: string): ISubmission[] => {
  // In a real database, we would filter by both studentId and courseId
  // For this mock, we're just filtering by studentId
  return submissions.filter(submission => submission.studentId === studentId);
}

export const getSubmissionByAssignmentProblemAndStudent = (assignmentId: string, problemId: string, studentId: string): ISubmission | undefined => {
  return submissions.find(submission => 
    submission.assignmentId === assignmentId && 
    submission.problemId === problemId && 
    submission.studentId === studentId
  );
}

export const getSubmissionsByAssignmentId = (assignmentId: string): ISubmission[] => {
  return submissions.filter(submission => submission.assignmentId === assignmentId);
}

export const getSubmissionsByProblemId = (problemId: string): ISubmission[] => {
  return submissions
    .filter(submission => submission.problemId === problemId)
    .sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime());
};

export const getAdjacentSubmissionIds = (currentSubmissionId: string, problemId: string): { prevId: string | null, nextId: string | null } => {
  const problemSubmissions = getSubmissionsByProblemId(problemId);
  const currentIndex = problemSubmissions.findIndex(s => s._id === currentSubmissionId);

  return {
    prevId: currentIndex > 0 ? problemSubmissions[currentIndex - 1]._id : null,
    nextId: currentIndex < problemSubmissions.length - 1 ? problemSubmissions[currentIndex + 1]._id : null,
  };
};

