import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IProblem } from '@@/models/Assignment'
import { ISubmission } from '@@/models/Submission'

interface ProblemCardProps {
  problem: IProblem;
  questionNumber: number;
  submissions: ISubmission[];
}

export function GradingProblemCard({ problem, questionNumber, submissions }: ProblemCardProps) {
  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter(s => s.graded).length;
  const gradedPercentage = totalSubmissions > 0 ? (gradedSubmissions / totalSubmissions) * 100 : 0;

  const getRubricStatus = () => {
    if (problem.rubric.length === 0) return 'empty';
    if (problem.rubricFinalized) return 'finalized';
    return 'not-finalized';
  }

  const rubricStatus = getRubricStatus();
  const statusColors = {
    empty: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'not-finalized': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    finalized: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  };

  const statusText = {
    empty: 'No Rubric',
    'not-finalized': 'Rubric Not Finalized',
    finalized: 'Rubric Finalized'
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Question {questionNumber}</span>
          <Badge className={statusColors[rubricStatus]}>
            {statusText[rubricStatus]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 line-clamp-2" title={problem.question}>{problem.question}</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Grading Progress</span>
          <span className="text-sm text-muted-foreground">
            {gradedSubmissions} / {totalSubmissions} graded
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-green-600 h-2.5 rounded-full"
            style={{ width: `${gradedPercentage}%` }}
          ></div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Max Points: {problem.maxPoints}
        </p>
      </CardContent>
    </Card>
  )
}

