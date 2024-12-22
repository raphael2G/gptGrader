export interface ISubmission {
  _id?: string;
  assignmentId: string;
  problemId: string;
  studentId: string;
  answer: string;
  submittedAt: Date;
  graded: boolean;
  gradedBy?: string; 
  gradedAt?: Date;
  appliedRubricItemIds: string[]; 
  createdAt: Date;
  updatedAt: Date;
  feedback?: string;
  selfGraded?: boolean,
  selfGrade?: number,
  selfGradingStatus?: 'pending' | 'completed';
  selfGradingCompletedAt?: Date;
  selfAssessedRubricItems?: {
    rubricItemId: string;
    comment?: string;
  }[];
  discrepancyReports?: string[]; // Array of discrepancy report IDs
}

