export interface IDiscrepancyItem {
  _id?: string;
  submissionId: string;
  studentId: string;
  courseId: string;
  assignmentId: string;
  problemId: string;
  rubricItemId: string;
  
  wasApplied: boolean;
  studentThinksShouldBeApplied: boolean;
  studentExplanation: string;
  resolution?: {
    shouldBeApplied: boolean;
    explanation: string;
    discrepancyType: 'student_error' | 'grading_error';
    resolvedBy: string;
    resolvedAt: Date;
  };
}

export interface IDiscrepancyReport {
  _id?: string;
  submissionId: string;
  studentId: string;
  courseId: string;
  assignmentId: string;
  problemId: string;
  
  status: 'pending' | 'resolved';
  items: IDiscrepancyItem[];
  createdAt: Date;
  updatedAt: Date;
}

