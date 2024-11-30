export interface RubricItem { description: string; points: number; }
export interface Problem { id: string; question: string; maxPoints: number | undefined; rubric: RubricItem[]; }
export interface Assignment { id: string; title: string; dueDate: string; finalSubmissionDeadline: string; status: 'not-started' | 'in-progress' | 'completed'; released: boolean; problems: Problem[]; }
export interface Course { id: string; title: string; description: string; instructor: string; assignments: Assignment[]; }

const mathProblems1: Problem[] = [
  { id: 'math101-hw1-p1', question: 'Solve the linear equation: 3x + 7 = 22', maxPoints: 10, rubric: [{ description: 'Correctly isolates x', points: 5 }, { description: 'Provides correct final answer', points: 5 }, { description: "goofy goofy negative", points: -2.3}] },
  { id: 'math101-hw1-p2', question: 'Graph the line y = 2x - 4', maxPoints: 15, rubric: [{ description: 'Correct slope', points: 5 }, { description: 'Correct y-intercept', points: 5 }, { description: 'Accurate graph scaling', points: 5 }] }
];
const mathProblems2: Problem[] = [
  { id: 'math101-hw2-p1', question: 'Find roots of the quadratic equation x^2 - 5x + 6 = 0', maxPoints: 10, rubric: [{ description: 'Applies correct factoring or quadratic formula', points: 5 }, { description: 'Finds both roots correctly', points: 5 }] },
  { id: 'math101-hw2-p2', question: 'Graph the parabola y = x^2 - 4x + 3', maxPoints: 15, rubric: [{ description: 'Includes correct vertex', points: 5 }, { description: 'Plots x-intercepts accurately', points: 5 }, { description: 'Correct parabola direction', points: 5 }] }
];
const mathAssignments: Assignment[] = [
  { id: 'math101-hw1', title: 'Linear Equations', dueDate: '2023-06-15', finalSubmissionDeadline: '2023-06-22', status: 'completed', released: true, problems: mathProblems1 },
  { id: 'math101-hw2', title: 'Quadratic Functions', dueDate: '2023-06-22', finalSubmissionDeadline: '2023-06-29', status: 'in-progress', released: true, problems: mathProblems2 }
];

const csProblems1: Problem[] = [
  { id: 'cs101-hw1-p1', question: 'Write a Python function to calculate factorial', maxPoints: 10, rubric: [{ description: 'Valid input handling', points: 3 }, { description: 'Correct output for edge cases', points: 7 }] },
  { id: 'cs101-hw1-p2', question: 'Explain the difference between lists and tuples', maxPoints: 5, rubric: [{ description: 'Defines lists and tuples correctly', points: 3 }, { description: 'Highlights key differences', points: 2 }] }
];
const csAssignments: Assignment[] = [
  { id: 'cs101-hw1', title: 'Python Basics', dueDate: '2023-06-14', finalSubmissionDeadline: '2023-06-21', status: 'completed', released: true, problems: csProblems1 },
  { id: 'cs101-hw2', title: 'Data Structures', dueDate: '2023-06-21', finalSubmissionDeadline: '2023-06-28', status: 'not-started', released: false, problems: [{ id: 'cs101-hw2-p1', question: 'Implement a stack in Python', maxPoints: 15, rubric: [{ description: 'Push operation works', points: 5 }, { description: 'Pop operation works', points: 5 }, { description: 'Handles edge cases', points: 5 }] }] }
];

const historyProblems1: Problem[] = [
  { id: 'hist101-hw1-p1', question: 'Compare and contrast Egypt and Mesopotamia', maxPoints: 15, rubric: [{ description: 'Explains key similarities', points: 7 }, { description: 'Explains key differences', points: 8 }] },
  { id: 'hist101-hw1-p2', question: 'Discuss Greek contributions to Western civilization', maxPoints: 10, rubric: [{ description: 'Identifies major contributions', points: 5 }, { description: 'Explains their impact', points: 5 }] }
];
const historyAssignments: Assignment[] = [
  { id: 'hist101-hw1', title: 'Ancient Civilizations', dueDate: '2023-06-16', finalSubmissionDeadline: '2023-06-23', status: 'completed', released: true, problems: historyProblems1 },
  { id: 'hist101-hw2', title: 'Middle Ages', dueDate: '2023-06-23', finalSubmissionDeadline: '2023-06-30', status: 'not-started', released: false, problems: [{ id: 'hist101-hw2-p1', question: 'Discuss the impact of the Black Death', maxPoints: 10, rubric: [{ description: 'Identifies social impacts', points: 5 }, { description: 'Discusses economic consequences', points: 5 }] }] }
];

const physicsProblems1: Problem[] = [
  { id: 'physics101-hw1-p1', question: 'Calculate the displacement of an object with an initial velocity of 5 m/s, an acceleration of 2 m/s², and a time of 10 seconds.', maxPoints: 10, rubric: [{ description: 'Correctly applies the kinematic equation', points: 5 }, { description: 'Provides the correct displacement', points: 5 }] },
  { id: 'physics101-hw1-p2', question: 'Graph the motion of an object under uniform acceleration starting from rest.', maxPoints: 15, rubric: [{ description: 'Accurately plots velocity vs. time', points: 5 }, { description: 'Accurately plots displacement vs. time', points: 5 }, { description: 'Provides correct labels and scales for graphs', points: 5 }] },
  { id: 'physics101-hw1-p3', question: 'Describe the differences between scalar and vector quantities with examples.', maxPoints: 5, rubric: [{ description: 'Defines scalar and vector quantities correctly', points: 3 }, { description: 'Provides relevant examples for each', points: 2 }] }
];
const physicsAssignments: Assignment[] = [
  { id: 'physics101-hw1', title: 'Kinematics and Motion', dueDate: '2024-12-15', finalSubmissionDeadline: '2024-12-22', status: 'not-started', released: false, problems: physicsProblems1 }
];

export const courses: Course[] = [
  { id: 'mathematics101', title: 'Mathematics 101', description: 'An introduction to mathematical concepts.', instructor: 'Dr. Jane Smith', assignments: mathAssignments },
  { id: 'physics101', title: 'Physics 101', description: 'An introduction to fundamental concepts in physics, including motion, forces, and energy.', instructor: 'Dr. Albert Newton', assignments: physicsAssignments },
  { id: 'computerscience101', title: 'Introduction to Computer Science', description: 'Learn the basics of programming.', instructor: 'Prof. John Doe', assignments: csAssignments },
  { id: 'worldhistory101', title: 'World History', description: 'Explore key events in history.', instructor: 'Dr. Emily Johnson', assignments: historyAssignments }
];

export function getCourse(id: string): Course | undefined { return courses.find(course => course.id === id); }
export function getAssignment(courseId: string, assignmentId: string): Assignment | undefined { const course = getCourse(courseId); return course?.assignments.find(assignment => assignment.id === assignmentId); }
export function getProblem(courseId: string, assignmentId: string, problemId: string): Problem | undefined { const assignment = getAssignment(courseId, assignmentId); return assignment?.problems.find(problem => problem.id === problemId); }
export function isAssignmentReleased(courseId: string, assignmentId: string): boolean { const assignment = getAssignment(courseId, assignmentId); return assignment?.released || false; }
export function getRubric(courseId: string, assignmentId: string, problemId: string): RubricItem[] | undefined { const problem = getProblem(courseId, assignmentId, problemId); return problem?.rubric; }

