import { IDiscrepancyReport } from '@@/models/DiscrepancyReport';

export const discrepancyReports: IDiscrepancyReport[] = [

];

export function getDiscrepancyReportsByProblem(problemId: string): IDiscrepancyReport[] {
  // In a real database, we would filter by problemId
  // For this mock, we're just returning all reports
  return discrepancyReports;
}

export function getDiscrepancyReportStatsByRubricItem(problemId: string) {
  const reports = getDiscrepancyReportsByProblem(problemId);
  
  const statsByRubricItem: { [key: string]: number } = {};

  reports.forEach(report => {
    if (!statsByRubricItem[report.rubricItemId]) {
      statsByRubricItem[report.rubricItemId] = 0;
    }
    statsByRubricItem[report.rubricItemId]++;
  });

  return statsByRubricItem;
}

