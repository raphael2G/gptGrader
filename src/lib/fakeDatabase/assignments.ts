import { IAssignment, IProblem, IRubricItem } from '@/models/Assignment'

export const assignments: IAssignment[] = [
  {
    _id: 'assignment1',
    courseId: 'course1',
    title: 'Introduction to Python',
    description: 'Learn the basics of Python programming',
    dueDate: new Date('2023-09-15'),
    finalSubmissionDeadline: new Date('2023-09-22'),
    status: 'closed',
    gradingStatus: 'in-progress',
    problems: [
      {
        id: 'problem1',
        question: 'Write a function to calculate the factorial of a number',
        maxPoints: 10,
        rubric: [
          { id: 'rubric1', description: 'Correct implementation', points: 7 },
          { id: 'rubric2', description: 'Proper use of recursion', points: 3 },
          { id: 'rubric3', description: 'Incorrect base case', points: -2 },
          { id: 'rubric4', description: 'Inefficient implementation', points: -1 }
        ],
        rubricFinalized: true // Rubric finalized
      },
      {
        id: 'problem2',
        question: 'Create a list comprehension to generate even numbers from 1 to 20',
        maxPoints: 8,
        rubric: [], // Empty rubric
        rubricFinalized: false // Rubric not finalized
      },
      {
        id: 'problem3',
        question: 'Write a Python function to check if a given string is a palindrome',
        maxPoints: 12,
        rubric: [], // Empty rubric
        rubricFinalized: false // Rubric not finalized
      }
    ],
    createdAt: new Date('2023-08-01'),
    updatedAt: new Date('2023-08-01')
  },
  {
    _id: 'assignment2',
    courseId: 'course1',
    title: 'Data Types and Variables',
    description: 'Understand different data types and variable usage in Python',
    dueDate: new Date('2023-09-30'),
    finalSubmissionDeadline: new Date('2023-10-07'),
    status: 'closed',
    gradingStatus: 'not-started',
    problems: [
      {
        id: 'problem1',
        question: 'Explain the difference between mutable and immutable data types in Python',
        maxPoints: 5,
        rubric: [
          { id: 'rubric1', description: 'Clear explanation of mutability', points: 2 },
          { id: 'rubric2', description: 'Correct examples provided', points: 3 }
        ],
        rubricFinalized: false
      },
      {
        id: 'problem2',
        question: 'Write a Python program that demonstrates the use of different data types',
        maxPoints: 10,
        rubric: [
          { id: 'rubric1', description: 'Correct use of integers', points: 2 },
          { id: 'rubric2', description: 'Correct use of floats', points: 2 },
          { id: 'rubric3', description: 'Correct use of strings', points: 2 },
          { id: 'rubric4', description: 'Correct use of lists', points: 2 },
          { id: 'rubric5', description: 'Correct use of dictionaries', points: 2 }
        ],
        rubricFinalized: true
      }
    ],
    createdAt: new Date('2023-08-15'),
    updatedAt: new Date('2023-08-15')
  },
  {
    _id: 'assignment3',
    courseId: 'course1',
    title: 'Control Structures in Python',
    description: 'Implement various control structures in Python',
    dueDate: new Date('2023-10-15'),
    finalSubmissionDeadline: new Date('2023-10-22'),
    status: 'released',
    gradingStatus: 'not-started',
    problems: [
      {
        id: 'problem1',
        question: 'Write a Python function that uses if-else statements to determine if a number is positive, negative, or zero',
        maxPoints: 10,
        rubric: [
          { id: 'rubric1', description: 'Correct implementation of if-else', points: 5 },
          { id: 'rubric2', description: 'Proper handling of all cases', points: 5 }
        ],
        rubricFinalized: false
      },
      {
        id: 'problem2',
        question: 'Implement a for loop to calculate the factorial of a number',
        maxPoints: 10,
        rubric: [
          { id: 'rubric1', description: 'Correct use of for loop', points: 5 },
          { id: 'rubric2', description: 'Accurate factorial calculation', points: 5 }
        ],
        rubricFinalized: true
      }
    ],
    createdAt: new Date('2023-09-15'),
    updatedAt: new Date('2023-09-15')
  },
  {
    _id: 'assignment4',
    courseId: 'course1',
    title: 'Functions and Modules',
    description: 'Create and use functions and modules in Python',
    dueDate: new Date('2023-10-30'),
    finalSubmissionDeadline: new Date('2023-11-06'),
    status: 'unreleased',
    gradingStatus: 'not-started',
    problems: [
      {
        id: 'problem1',
        question: 'Write a Python function that calculates the area of a circle given its radius',
        maxPoints: 10,
        rubric: [
          { id: 'rubric1', description: 'Correct function definition', points: 3 },
          { id: 'rubric2', description: 'Proper use of math module', points: 3 },
          { id: 'rubric3', description: 'Accurate calculation', points: 4 }
        ],
        rubricFinalized: true
      },
      {
        id: 'problem2',
        question: 'Create a module with functions for basic arithmetic operations and use it in a main program',
        maxPoints: 15,
        rubric: [
          { id: 'rubric1', description: 'Correct module creation', points: 5 },
          { id: 'rubric2', description: 'Implementation of arithmetic functions', points: 5 },
          { id: 'rubric3', description: 'Proper use of module in main program', points: 5 }
        ],
        rubricFinalized: false
      }
    ],
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01')
  },
  {
    _id: 'assignment5',
    courseId: 'course1',
    title: 'File Handling and Exception Handling',
    description: 'Learn to work with files and handle exceptions in Python',
    dueDate: new Date('2023-11-15'),
    finalSubmissionDeadline: new Date('2023-11-22'),
    status: 'closed',
    gradingStatus: 'not-started',
    problems: [
      {
        id: 'problem1',
        question: 'Write a Python program that reads a text file, counts the occurrences of each word, and writes the results to a new file',
        maxPoints: 15,
        rubric: [
          { id: 'rubric1', description: 'Correct file reading', points: 3 },
          { id: 'rubric2', description: 'Accurate word counting', points: 5 },
          { id: 'rubric3', description: 'Correct file writing', points: 3 },
          { id: 'rubric4', description: 'Proper exception handling', points: 4 }
        ],
        rubricFinalized: false
      },
      {
        id: 'problem2',
        question: 'Implement a custom exception class and use it in a program that performs division',
        maxPoints: 10,
        rubric: [
          { id: 'rubric1', description: 'Correct custom exception class', points: 4 },
          { id: 'rubric2', description: 'Proper use of try-except blocks', points: 3 },
          { id: 'rubric3', description: 'Handling of division by zero', points: 3 }
        ],
        rubricFinalized: true
      }
    ],
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2023-10-15')
  }
];

export const getAssignmentsByCourseId = (courseId: string): IAssignment[] => {
  return assignments.filter(assignment => assignment.courseId === courseId);
}

export const getAssignmentById = (assignmentId: string): IAssignment | undefined => {
  return assignments.find(assignment => assignment._id === assignmentId);
}

export const updateAssignment = (assignmentId: string, updatedAssignment: Partial<IAssignment>): IAssignment | undefined => {
  const index = assignments.findIndex(assignment => assignment._id === assignmentId);
  if (index !== -1) {
    assignments[index] = { ...assignments[index], ...updatedAssignment, updatedAt: new Date() };
    return assignments[index];
  }
  return undefined;
}

export const addProblemToAssignment = (assignmentId: string, problem: IProblem): IAssignment | undefined => {
  const assignment = assignments.find(assignment => assignment._id === assignmentId)
  if (assignment) {
    assignment.problems.push({
      ...problem,
      rubricFinalized: problem.rubricFinalized || false, // Set default value if not provided
    })
    assignment.updatedAt = new Date()
    return assignment
  }
  return undefined
}

export const updateProblem = (assignmentId: string, problemId: string, updatedProblem: Partial<IProblem>): IAssignment | undefined => {
  const assignment = assignments.find(assignment => assignment._id === assignmentId)
  if (assignment) {
    const problemIndex = assignment.problems.findIndex(problem => problem.id === problemId)
    if (problemIndex !== -1) {
      assignment.problems[problemIndex] = { 
        ...assignment.problems[problemIndex], 
        ...updatedProblem,
        rubricFinalized: updatedProblem.rubricFinalized !== undefined ? updatedProblem.rubricFinalized : assignment.problems[problemIndex].rubricFinalized,
      }
      assignment.updatedAt = new Date()
      return assignment
    }
  }
  return undefined
}

export const addRubricItemToProblem = (assignmentId: string, problemId: string, rubricItem: IRubricItem): IAssignment | undefined => {
  const assignment = assignments.find(assignment => assignment._id === assignmentId)
  if (assignment) {
    const problem = assignment.problems.find(problem => problem.id === problemId)
    if (problem) {
      problem.rubric.push(rubricItem)
      assignment.updatedAt = new Date()
      return assignment
    }
  }
  return undefined
}

export const updateRubricItem = (assignmentId: string, problemId: string, rubricItemId: string, updatedRubricItem: Partial<IRubricItem>): IAssignment | undefined => {
  const assignment = assignments.find(assignment => assignment._id === assignmentId)
  if (assignment) {
    const problem = assignment.problems.find(problem => problem.id === problemId)
    if (problem) {
      const rubricItemIndex = problem.rubric.findIndex(item => item.id === rubricItemId)
      if (rubricItemIndex !== -1) {
        problem.rubric[rubricItemIndex] = { ...problem.rubric[rubricItemIndex], ...updatedRubricItem }
        assignment.updatedAt = new Date()
        return assignment
      }
    }
  }
  return undefined
}

