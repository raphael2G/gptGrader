interface SubmissionData {
    answer: string;
    submissionTime: Date;
  }
  
  const dummyDatabase: Record<string, SubmissionData> = {};
  
  export function getLastSubmission(questionId: string): SubmissionData | null {
    return dummyDatabase[questionId] || null;
  }
  
  export function saveSubmission(questionId: string, answer: string): void {
    dummyDatabase[questionId] = {
      answer,
      submissionTime: new Date(),
    };
  }
  
  