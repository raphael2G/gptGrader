import { Course, Problem } from './courses'

export type AssignmentStatus = 'unreleased' | 'released' | 'closed'


export interface InstructorAssignment {
  id: string
  title: string
  dueDate: string
  finalSubmissionDeadline: string
  status: AssignmentStatus
  problems: Problem[]
}

export interface InstructorCourse extends Omit<Course, 'assignments'> {
  assignments: InstructorAssignment[]
}

const computationalBiologyProblems: Problem[] = [
  {
    id: 'cb101-hw1-p1',
    question: 'Explain the central dogma of molecular biology and its relevance to computational biology.',
    maxPoints: 10,
    rubric: [
      { description: 'Correctly defines central dogma', points: 3 },
      { description: 'Explains DNA to RNA transcription', points: 2 },
      { description: 'Explains RNA to protein translation', points: 2 },
      { description: 'Discusses relevance to computational biology', points: 3 }
    ]
  },
  {
    id: 'cb101-hw1-p2',
    question: 'Write a Python function to calculate the GC content of a given DNA sequence.',
    maxPoints: 15,
    rubric: [
      { description: 'Correct function definition', points: 3 },
      { description: 'Accurately counts G and C nucleotides', points: 5 },
      { description: 'Correctly calculates percentage', points: 5 },
      { description: 'Handles edge cases (empty string, invalid characters)', points: 2 }
    ]
  }
]

let instructorCourses: InstructorCourse[] = [
  {
    id: 'cb101',
    title: 'Introduction to Computational Biology',
    description: 'This course introduces fundamental concepts in computational biology, including molecular biology basics, sequence analysis, and Python programming for bioinformatics.',
    instructor: 'Dr. Jane Smith',
    assignments: [
      {
        id: 'cb101-hw1',
        title: 'Introduction to Molecular Biology and Python',
        dueDate: '2023-07-15',
        finalSubmissionDeadline: '2023-07-22',
        status: 'released',
        problems: computationalBiologyProblems
      }
    ]
  }
]

export function getInstructorCourses(): any {
  return instructorCourses
}

export function addInstructorCourse(course: InstructorCourse): void {
  instructorCourses.push(course)
}

export function updateInstructorCourse(updatedCourse: any): void {
  const index = instructorCourses.findIndex(course => course.id === updatedCourse.id)
  if (index !== -1) {
    instructorCourses[index] = updatedCourse
  }
}

export function deleteInstructorCourse(courseId: string): void {
  instructorCourses = instructorCourses.filter(course => course.id !== courseId)
}

export function addAssignmentToCourse(courseId: string, newAssignment: InstructorAssignment): void {
  const courseIndex = instructorCourses.findIndex(course => course.id === courseId)
  if (courseIndex !== -1) {
    instructorCourses[courseIndex].assignments.push(newAssignment)
  }
}

export function updateAssignmentStatus(courseId: string, assignmentId: string, newStatus: AssignmentStatus): void {
  const courseIndex = instructorCourses.findIndex(course => course.id === courseId)
  if (courseIndex !== -1) {
    const assignmentIndex = instructorCourses[courseIndex].assignments.findIndex(assignment => assignment.id === assignmentId)
    if (assignmentIndex !== -1) {
      instructorCourses[courseIndex].assignments[assignmentIndex].status = newStatus
    }
  }
}

