

export interface IBulkGradingProgress {
  totalSubmissions: number;
  completedSubmissions: number;
  failedSubmissions: number;
}

export type IGradingResponse = {
  rubric_evaluation: {
      rubric_item_id: string;
      meets_criteria_of_this_item_description: boolean;
      comments: string;
  }[];
  global_feedback: {
      strengths: string;
      weaknesses: string;
      suggestions: string;
  };
}