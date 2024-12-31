'use client'

import { notFound } from 'next/navigation'
import { BackButton } from '@/components/various/BackButton'
import { Loader2 } from 'lucide-react'
import { ISubmission } from '@/models/Submission'
import { useToast } from "@/components/ui/use-toast"
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetAssignmentById } from '@/hooks/queries/useAssignments'
import { UserAuth } from '@/contexts/AuthContext'
import { useGetSubmissionsByStudentIdAndAssignmentId } from '@/hooks/queries/useSubmissions'



export default function AssignmentPage({ params }: { params: { courseId: string, assignmentId: string } }) {
  const { toast } = useToast()
  const user = UserAuth().user;

  const {
    data: assignment,
    isLoading: assignmentLoading,
    error: assignmentError
  } = useGetAssignmentById(params.assignmentId)

  const {
    data: submissions = [], // Default to empty array
    isLoading: submissionsLoading
  } = useGetSubmissionsByStudentIdAndAssignmentId(user?._id?.toString() || '', params.assignmentId, {enabled: !!user?._id})


  // Handle assignment loading error
  if (assignmentError) {
    toast({
      title: "Error",
      description: "Failed to load assignment details",
      variant: "destructive",
    })
    return notFound()
  }

  // Loading state
  if (assignmentLoading || submissionsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Not found state
  if (!assignment) {
    return notFound()
  }

  const getAssignmentStatus = () => {
    const currentDate = new Date()
    const dueDate = new Date(assignment.dueDate)
    const allSubmitted = assignment.problems.every(problem => 
      submissions.some(submission => submission.problemId === problem._id)
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
      // need to work out the logic for determining if the self grading of an assignment is done or not
      if (true && !allSubmitted) {
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

    return {
      status: "Unknown",
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const { status, color } = getAssignmentStatus()

  return (
    <div className="space-y-6">
      <BackButton />
      <div>
        <h1 className="text-3xl font-bold">{assignment.title}</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Due: {new Date(assignment.dueDate).toLocaleDateString()}
        </p>
        <Badge className={color}>{status}</Badge>
      </div>
      <p className="text-lg">{assignment.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignment.problems.map((problem, index) => {
          const submission = submissions.find(s => s.problemId === problem._id)
          return (
            <Link 
              key={problem._id.toString()} 
              href={`/courses/${params.courseId}/assignments/${params.assignmentId}/${problem._id}`}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Problem {index + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="truncate">{problem.question}</p>
                  <Badge 
                    className={submission ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  >
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