import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { Problem } from '@/lib/dummy/courses'
import ProblemCard from '@/components/dashboard/manageCourses/ProblemCard'

interface ProblemListProps {
  problems: Problem[];
  onEditProblem: (problem: Problem) => void;
  onUpdateProblem: (updatedProblem: Problem) => void;
  onAddProblem: () => void;
  onDeleteProblem: (problemId: string) => void;
}

export function ProblemList({ problems, onEditProblem, onUpdateProblem, onAddProblem, onDeleteProblem }: ProblemListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Problems</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {problems.map((problem, index) => (
          <ProblemCard 
            key={problem.id} 
            problem={problem} 
            index={index}
            onEdit={() => onEditProblem(problem)}
            onUpdateProblem={onUpdateProblem}
            onDeleteProblem={onDeleteProblem}
          />
        ))}
        <Button onClick={onAddProblem} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Problem
        </Button>
      </CardContent>
    </Card>
  )
}

