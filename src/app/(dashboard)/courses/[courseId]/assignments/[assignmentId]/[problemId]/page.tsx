'use client'

import { BackButton } from '@/components/various/BackButton'
import { ProblemView } from '@/components/dashboard/courses/ProblemView'
import { GradedProblemView } from '@/components/dashboard/courses/GradedProblemView'
import { Loader2 } from 'lucide-react'
import { useGetAssignmentById } from '@/hooks/queries/useAssignments'
import { useRouter } from 'next/navigation'

export default function ProblemPage({params}: { params: { courseId: string, assignmentId: string, problemId: string  }}) {
  const router = useRouter()

  const { data: assignment, isLoading, error } = useGetAssignmentById(params.assignmentId)

  // Handle error state
  if (error) {
    router.push(`/courses/${params.courseId}/assignments/${params.assignmentId}`)
    return <div>Uh oh. something went wrong loading this problem...</div>
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If we have no assignment data, something went wrong
  if (!assignment) {
    router.push(`/courses/${params.courseId}/assignments/${params.assignmentId}`)
    return null
  }

  

  return (
    <div className="space-y-6">
      <BackButton />
      {assignment.areGradesReleased ? (
        <GradedProblemView
          courseId={params.courseId}
          assignmentId={params.assignmentId}
          problemId={params.problemId}
        />
      ) : (
        <ProblemView
          courseId={params.courseId}
          assignmentId={params.assignmentId}
          problemId={params.problemId}
        />
      )}
    </div>
  )
}