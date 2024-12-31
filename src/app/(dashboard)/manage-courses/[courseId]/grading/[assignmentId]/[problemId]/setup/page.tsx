'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { BackButton } from '@/components/various/BackButton'
import { GradingProcessSteps } from '@/components/dashboard/grading/GradingProcessSteps'
import { useGetAssignmentById } from '@/hooks/queries/useAssignments'
import { Loader2 } from 'lucide-react'

export default function MakeRubricLandingPage({ 
  params 
}: { 
  params: { courseId: string, assignmentId: string, problemId: string } 
}) {
  // hooks
  const router = useRouter()
  const { data: assignment, isLoading, error } = useGetAssignmentById(params.assignmentId)

  // TODO
  // local state - this is for the current (fake) implementation of grading all
  const [grading, setGrading] = useState(false)

  // loading & error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !assignment) {
    router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}`)
    return null
  }

  // derived state
  const problem = assignment?.problems.find(p => p._id?.toString() === params.problemId)
  const questionNumber = problem ? assignment.problems.findIndex(p => p._id?.toString() === params.problemId) + 1 : 0
  const hasRubric = problem?.rubric?.items?.length ? problem.rubric.items.length > 0 : false
  const isRubricFinalized = problem?.rubricFinalized ?? false



  if (!problem) {
    router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}`)
    return null
  }



  return (
    <div className="space-y-6 p-6">
      <BackButton backLink={`/manage-courses/${params.courseId}/grading/${params.assignmentId}`} />
      <h1 className="text-3xl font-bold text-center">
        Create Rubric: {assignment.title} Q{questionNumber}
      </h1>
      <GradingProcessSteps
        courseId={params.courseId}
        assignmentId={params.assignmentId}
        problemId={params.problemId}
      />
      {isRubricFinalized && (
        <div className="mt-4 flex justify-center">
          <Button 
            onClick={() => router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/graded`)} 
            disabled={grading}
          >
            View Student Grades
          </Button>
        </div>
      )}
    </div>
  )
}