'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BackButton } from '@/components/various/BackButton'
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { IAssignment, IProblem } from '@@/models/Assignment'
import { useToast } from "@/components/ui/use-toast"
import { StudentSubmissionsTable } from '@/components/dashboard/grading/StudentSubmissionTable'

export default function GradeProblemPage({ 
  params 
}: { 
  params: { courseId: string, assignmentId: string, problemId: string } 
}) {
  const [assignment, setAssignment] = useState<IAssignment | null>(null)
  const [problem, setProblem] = useState<IProblem | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const assignmentResponse = await assignmentApi.getAssignmentById(params.assignmentId)

        if (assignmentResponse.data) {
          setAssignment(assignmentResponse.data)
          const foundProblem = assignmentResponse.data.problems.find(p => p.id === params.problemId)
          if (foundProblem) {
            setProblem(foundProblem)
          } else {
            throw new Error('Problem not found')
          }
        } else {
          throw new Error('Failed to fetch assignment data')
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          variant: "destructive",
        })
        router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.courseId, params.assignmentId, params.problemId, router, toast])

  if (loading) {
    return <div>Loading problem data...</div>
  }

  if (!assignment || !problem) {
    return <div>Problem not found.</div>
  }

  return (
    <div className="space-y-6">
      <BackButton backLink={`/manage-courses/${params.courseId}/grading/${params.assignmentId}`} />
      <h1 className="text-3xl font-bold">Grading: {assignment.title} - Problem {problem.id}</h1>
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

