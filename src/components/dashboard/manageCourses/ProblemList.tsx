import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from 'lucide-react'
import { IProblem } from '@/models/Assignment'
import ProblemCard from '@/components/dashboard/manageCourses/ProblemCard'
import { useGetAssignmentById, useUpsertProblem } from "@/hooks/queries/useAssignments"
import { Skeleton } from "@/components/ui/skeleton"

interface ProblemListProps {
  assignmentId: string;
}

export function ProblemList({ assignmentId }: ProblemListProps) {
  const router = useRouter()
  
  // Fetch assignment data
  const { data: assignment, isLoading: isFetchingAssignment, error } = useGetAssignmentById(assignmentId)

  // Mutations for problem management
  const { mutate: upsertProblem, isPending: isUpsertingProblem } = useUpsertProblem()

  // Handle loading state
  if (isFetchingAssignment) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  // Handle error state
  if (error) {
    router.back()
    return null
  }

  // Handle missing assignment data
  if (!assignment) {
    router.back()
    return null
  }

  // Handlers for problem management
  const handleEditProblem = (problem: IProblem) => {
    upsertProblem({
      assignmentId,
      problemData: problem
    })
  }

  const handleUpdateProblem = (updatedProblem: IProblem) => {
    upsertProblem({
      assignmentId,
      problemData: updatedProblem
    })
  }


  const handleAddProblem = () => {
    // Create a new problem with default values
    const newProblem: Partial<IProblem> = {
      question: "New Problem",
      maxPoints: 0,
      orderIndex: assignment.problems.length,
      rubric: {
        items: []
      },
      rubricFinalized: false,
      referenceSolution: ""
    }

    upsertProblem({
      assignmentId,
      problemData: newProblem
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Problems</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignment.problems.map((problem, index) => (
          <ProblemCard 
            key={problem._id?.toString() || index}
            problem={problem}
            assignmentId={assignment._id.toString()}
          />
        ))}
        <Button onClick={handleAddProblem} disabled={isUpsertingProblem} className="w-full">
          {isUpsertingProblem ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add Problem
        </Button>
      </CardContent>
    </Card>
  )
}

export default ProblemList