'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BackButton } from '@/components/various/BackButton'
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { submissionApi } from '@/app/lib/client-api/submissions'
import { IAssignment } from '@@/models/Assignment'
import { ISubmission } from '@@/models/Submission'
import { useToast } from "@/components/ui/use-toast"
import { GradingProblemCard } from '@/components/dashboard/grading/GradingProblemCard'
import Link from 'next/link'

export default function AssignmentGradingPage({ params }: { params: { courseId: string, assignmentId: string } }) {
  const [assignment, setAssignment] = useState<IAssignment | null>(null)
  const [submissions, setSubmissions] = useState<ISubmission[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [assignmentResponse, submissionsResponse] = await Promise.all([
          assignmentApi.getAssignmentById(params.assignmentId),
          submissionApi.getSubmissionsByAssignmentId(params.assignmentId)
        ])

        if (assignmentResponse.data && submissionsResponse.data) {
          setAssignment(assignmentResponse.data)
          setSubmissions(submissionsResponse.data)
        } else {
          throw new Error('Failed to fetch assignment or submissions data')
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          variant: "destructive",
        })
        router.push(`/manage-courses/${params.courseId}/grading`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.courseId, params.assignmentId, router, toast])

  if (loading) {
    return <div>Loading assignment data...</div>
  }

  if (!assignment) {
    return <div>Assignment not found.</div>
  }

  const totalSubmissions = submissions.length
  const gradedSubmissions = submissions.filter(s => s.graded).length
  const overallGradingProgress = totalSubmissions > 0 ? (gradedSubmissions / totalSubmissions) * 100 : 0

  return (
    <div className="space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">Grading: {assignment.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Description:</strong> {assignment.description}</p>
          <p><strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleDateString()}</p>
          <p><strong>Final Submission Deadline:</strong> {new Date(assignment.finalSubmissionDeadline).toLocaleDateString()}</p>
          <p><strong>Grading Status:</strong> {assignment.gradingStatus}</p>
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Overall Grading Progress</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Total Progress</span>
              <span className="text-sm text-muted-foreground">
                {gradedSubmissions} / {totalSubmissions} submissions graded
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${overallGradingProgress}%` }}
                role="progressbar"
                aria-valuenow={overallGradingProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {overallGradingProgress.toFixed(1)}% complete
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignment.problems.map((problem, index) => (
          <Link key={problem.id} href={`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${problem.id}`}>
            <GradingProblemCard 
              problem={problem}
              questionNumber={index + 1}
              submissions={submissions.filter(s => s.problemId === problem.id)}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}

