'use client'

import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BackButton } from '@/components/various/BackButton'
import { StudentSubmissionsTable } from '@/components/dashboard/grading/StudentSubmissionTable'

import { useGetAssignmentById } from '@/hooks/queries/useAssignments'
import { IAssignment, IProblem } from '@/models/Assignment'


export default function GradeProblemPage({ 
  params 
}: { 
  params: { courseId: string, assignmentId: string, problemId: string } 
}) {
  const router = useRouter()

  const { data: assignment, isLoading: isGettingAssignment, error: errorGettingAssignment } = useGetAssignmentById(params.assignmentId)
  const problem = assignment?.problems.find((p) => p._id.toString() === params.problemId)

  if (isGettingAssignment) {
    return <div>Getting Assignment...</div>
  }

  if (errorGettingAssignment){
    router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}`)
    return null
  }

  if (!assignment) {
    router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}`)
    return null
  }

  if (!problem){
    console.log("unable to fid the problem")
    router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}`)
    return null
  }



  return (
    <div className="space-y-6">
      <BackButton backLink={`/manage-courses/${params.courseId}/grading/${params.assignmentId}`} />
      <h1 className="text-3xl font-bold">Grading: {assignment.title} - Problem {problem.orderIndex + 1}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Problem Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Question:</strong> {problem.question}</p>
          <p><strong>Max Points:</strong> {problem.maxPoints}</p>
          <p><strong>Rubric Status:</strong> Finalized</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Student Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentSubmissionsTable 
            assignmentId={params.assignmentId}
            problemId={params.problemId}
            courseId={params.courseId}
          />
        </CardContent>
      </Card>
    </div>
  )
}

