export interface IDiscrepancyReport {
  id: string;
  
  // References
  submissionId: string;
  studentId: string;
  rubricItemId: string;  // Which rubric item is being disputed
  
  // The actual discrepancy
  selfAssessedScore: number;
  instructorScore: number;
  
  // Student's case
  discrepancyType: 'student_error' | 'grading_error';  // Student admitting error vs disputing grade
  studentExplanation: string;
  
  // Resolution
  status: 'pending' | 'resolved';
  resolution?: {
    finalScore: number;  // The final score after review
    explanation: string; // Instructor explanation
    resolvedBy: string;
    resolvedAt: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

