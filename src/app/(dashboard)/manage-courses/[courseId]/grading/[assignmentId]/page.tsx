'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BackButton } from '@/components/various/BackButton'
import { IAssignment } from '@/models/Assignment'
import { useToast } from "@/components/ui/use-toast"
import { GradingProblemCard } from '@/components/dashboard/grading/GradingProblemCard'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGetAssignmentById } from '@/hooks/queries/useAssignments'
import { useGetSubmissionsByAssignmentId } from '@/hooks/queries/useSubmissions'
import { Loader2 } from "lucide-react"

export default function AssignmentGradingPage({ 
  params 
}: { 
  params: { courseId: string, assignmentId: string } 
}) {
  // Standard setup
  const router = useRouter()
  const { toast } = useToast()

  // Data fetching with React Query
  const {
    data: assignment,
    isLoading: assignmentLoading,
    error: assignmentError
  } = useGetAssignmentById(params.assignmentId)

  const {
    data: submissions = [], // Default to empty array
    isLoading: submissionsLoading,
    error: submissionsError
  } = useGetSubmissionsByAssignmentId(params.assignmentId)

  // Loading state
  if (assignmentLoading || submissionsLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Error handling
  if (assignmentError || submissionsError || !assignment) {
    toast({
      title: "Error loading data",
      description: "Failed to fetch assignment data. Please try again.",
      variant: "destructive",
    })
    router.push(`/manage-courses/${params.courseId}/grading`)
    return null
  }

  // Compute derived state
  const totalSubmissions = submissions.length
  const gradedSubmissions = submissions.filter(s => s.graded).length
  const overallGradingProgress = totalSubmissions > 0 
    ? (gradedSubmissions / totalSubmissions) * 100 
    : 0

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
          <p><strong>Late Due Date:</strong> {new Date(assignment.lateDueDate).toLocaleDateString()}</p>
          
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
          <Link 
            key={problem._id?.toString()} 
            href={`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${problem._id?.toString()}`}
          >
            <GradingProblemCard 
              problem={problem}
              questionNumber={index + 1}
              submissions={submissions.filter(s => 
                s.problemId.toString() === problem._id?.toString()
              )}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}