export interface IRubricItem {
  description: string;
  points: number;
}

export interface IProblem {
  id: string;
  question: string;
  maxPoints: number;
  rubric: IRubricItem[];
  rubricFinalized: boolean;
  referenceSolution?: string;
}

export interface IAssignment {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: Date;
  finalSubmissionDeadline: Date;
  problems: IProblem[];
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean; // is an assignment a draft or not, can students see it yes or no
  areGradesReleased: boolean; // are students able to see their grades or not.
  gradingStatus: 'not-started' | 'in-progress' | 'completed';
}

