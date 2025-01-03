
export interface IGenerateRubricResponse {
  rubric: {
    rubric_item_criteria: string;
    rubric_item_score: number;
  }[]
}

export interface IRubricItemImprovementResponse {
  rubric_item_criteria: string;
  rubric_item_score: number;
}