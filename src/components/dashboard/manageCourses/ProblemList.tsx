import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { IProblem } from '@/models/Assignment'
import ProblemCard from '@/components/dashboard/manageCourses/ProblemCard'
import { assignmentApi } from '@/api-client/endpoints/assignments'

interface ProblemListProps {
  assignmentId: string;
}

export function ProblemList({ assignmentId }: ProblemListProps) {
  const [problems, setProblems] = useState<IProblem[]>([])

  useEffect(() => {
    const fetchProblems = async () => {
      const { data } = await assignmentApi.getAssignmentById(assignmentId)
      setProblems(data?.problems || [])
    }
    fetchProblems()
  }, [assignmentId])

  const handleUpdateProblem = async (updatedProblem: IProblem) => {
    await assignmentApi.upsertProblem(assignmentId, updatedProblem)
  }

  const handleAddProblem = async () => {
    const newProblem: Partial<IProblem> = {
      question: 'New Problem',
      maxPoints: 0,
      orderIndex: problems.length,
      rubric: { items: [] }
    }
    await assignmentApi.upsertProblem(assignmentId, newProblem)
  }

  const handleDeleteProblem = async (problemId: string) => {
    await assignmentApi.deleteProblem(assignmentId, problemId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Problems</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {problems.map((problem, index) => (
          <ProblemCard
            key={problem._id?.toString()} 
            problem={problem}
            index={index}
            onUpdateProblem={handleUpdateProblem}
            onDeleteProblem={() => handleDeleteProblem(problem._id!.toString())}
          />
        ))}
        <Button onClick={handleAddProblem} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Problem
        </Button>
      </CardContent>
    </Card>
  )
}