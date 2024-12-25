'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { BackButton } from '@/components/various/BackButton'
import { Loader2 } from 'lucide-react'
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { submissionApi } from '@/app/lib/client-api/submissions'
import { IAssignment, IProblem } from '@@/models/Assignment'
import { ISubmission } from '@@/models/Submission'
import { useToast } from "@/components/ui/use-toast"
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AssignmentPage({ params }: { params: { courseId: string, assignmentId: string } }) {
  const [assignment, setAssignment] = useState<IAssignment | null>(null)
  const [submissions, setSubmissions] = useState<ISubmission[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Placeholder for the actual student ID
  const studentId = '1'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [assignmentResponse, submissionsResponse] = await Promise.all([
          assignmentApi.getAssignmentById(params.assignmentId),
          submissionApi.getSubmissionsByAssignmentAndStudent(params.assignmentId, studentId)
        ])

        if (assignmentResponse.data) {
          setAssignment(assignmentResponse.data)
        } else {
          throw new Error(assignmentResponse.error?.error || 'Failed to fetch assignment')
        }

        if (submissionsResponse.data) {
          setSubmissions(submissionsResponse.data)
        } else {
          throw new Error(submissionsResponse.error?.error || 'Failed to fetch submissions')
        }
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        })
        router.push(`/courses/${params.courseId}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.courseId, params.assignmentId, router, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!assignment) {
    return notFound()
    return notFound()
  }

  const getAssignmentStatus = (assignment: IAssignment, submissions: ISubmission[]) => {
    const currentDate = new Date()
    const dueDate = new Date(assignment.dueDate)
    const allSubmitted = assignment.problems.every(problem => 
      submissions.some(submission => submission.problemId === problem.id)
    )

    if (currentDate < dueDate) {
      return {
        status: "Accepting Submissions",
        color: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200'
      }
    } else if (currentDate >= dueDate && !assignment.areGradesReleased) {
      return {
        status: "Not Graded",
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200'
      }
    } else if (assignment.areGradesReleased) {
      if (assignment.selfGradingEnabled && !allSubmitted) {
        return {
          status: "Need Self Grade",
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200'
        }
      } else {
        return {
          status: "Graded",
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-200'
        }
      }
    }

    // Default case (should not occur, but TypeScript requires it)
    return {
      status: "Unknown",
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const { status, color } = getAssignmentStatus(assignment, submissions)

  return (
    <div className="space-y-6">
      <BackButton />
      <div>
        <h1 className="text-3xl font-bold">{assignment.title}</h1>
        <p className="text-xl text-muted-foreground mt-2">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
        <Badge className={color}>{status}</Badge>
      </div>
      <p className="text-lg">{assignment.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignment.problems.map((problem, index) => {
          const submission = submissions.find(s => s.problemId === problem.id)
          return (
            <Link key={problem.id} href={`/courses/${params.courseId}/assignments/${params.assignmentId}/${problem.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Problem {index + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="truncate">{problem.question}</p>
                  <Badge className={submission ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {submission ? 'Submitted' : 'Not Submitted'}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}