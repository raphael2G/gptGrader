'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/various/BackButton'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IAssignment, IProblem } from '@/models/Assignment'
import { useToast } from "@/components/ui/use-toast"
import { NavigationBar } from '@/components/dashboard/reviewingSubmissions/NavigationBar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from '@/components/ui/button'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { ProfessorDisputeReviewSection } from '@/components/rubrics/ProfessorDisputeReviewSection'

// Import our React Query hooks
import { useGetAssignmentById } from '@/hooks/queries/useAssignments'
import { 
  useGetSubmissionsByStudentIdAssignmentIdAndProblemId,
  useGetSubmissionsByAssignmentId 
} from '@/hooks/queries/useSubmissions'
import { useGetUserById } from '@/hooks/queries/useUsers'
import { UserAuth } from '@/contexts/AuthContext'

export default function DiscrepancyReportPage({ 
  params 
}: { 
  params: { courseId: string, assignmentId: string, problemId: string, submissionId: string } 
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isReferenceSolutionExpanded, setIsReferenceSolutionExpanded] = useState(false)
  const {user} = UserAuth();

  // Fetch assignment data
  const {
    data: assignment,
    isLoading: assignmentLoading,
    error: assignmentError
  } = useGetAssignmentById(params.assignmentId)

  // Get the problem from the assignment
  const problem = assignment?.problems.find(p => p._id?.toString() === params.problemId)

  // Fetch submission data
  const {
    data: submission,
    isLoading: submissionLoading,
    error: submissionError
  } = useGetSubmissionsByStudentIdAssignmentIdAndProblemId(
    user?._id.toString() || '',
    params.assignmentId,
    params.problemId, 
    {enabled: !!user}
  )

  // Fetch all submissions for navigation
  const {
    data: allSubmissions = [],
    isLoading: allSubmissionsLoading,
    error: allSubmissionsError
  } = useGetSubmissionsByAssignmentId(params.assignmentId)

  // Fetch student data once we have the submission
  const {
    data: student,
    isLoading: studentLoading,
    error: studentError
  } = useGetUserById(submission?.studentId?.toString() || '', {
    enabled: !!submission?.studentId
  })

  // Calculate navigation state
  const currentIndex = allSubmissions.findIndex(s => s._id?.toString() === params.submissionId)
  const adjacentSubmissionIds = {
    prevId: currentIndex > 0 ? allSubmissions[currentIndex - 1]?._id?.toString() : null,
    nextId: currentIndex < allSubmissions.length - 1 ? allSubmissions[currentIndex + 1]?._id?.toString() : null,
  }

  // Navigation handler
  const navigateSubmission = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && adjacentSubmissionIds.prevId) {
      router.push(`/manage-courses/${params.courseId}/discrepancy-reports/${params.assignmentId}/${params.problemId}/${adjacentSubmissionIds.prevId}`)
    } else if (direction === 'next' && adjacentSubmissionIds.nextId) {
      router.push(`/manage-courses/${params.courseId}/discrepancy-reports/${params.assignmentId}/${params.problemId}/${adjacentSubmissionIds.nextId}`)
    }
  }

  // Loading state
  const isLoading = assignmentLoading || submissionLoading || allSubmissionsLoading || studentLoading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Error handling
  if (assignmentError || submissionError || allSubmissionsError || studentError || !problem) {
    router.push(`/manage-courses/${params.courseId}/discrepancy-reports/${params.assignmentId}/${params.problemId}`)
    return null
  }

  // Required data validation
  if (!assignment || !problem || !submission || !student) {
    return <div className="text-center text-red-500">Required data not found.</div>
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-grow overflow-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <BackButton backLink={`/manage-courses/${params.courseId}/discrepancy-reports/${params.assignmentId}/${params.problemId}`} />
          <div>
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">
              {assignment.title} - Q{problem.orderIndex + 1}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[65fr,35fr] gap-8">
          <div className="space-y-8">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Student Answer:</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="w-full min-h-[200px] border-2 border-gray-200 dark:border-gray-700 rounded-md p-2 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {submission?.answer || 'No submission found.'}
                </div>
              </CardContent>
            </Card>
            
            <Collapsible
              open={isReferenceSolutionExpanded}
              onOpenChange={setIsReferenceSolutionExpanded}
              className="w-full"
            >
              <Card>
                <CardHeader className="p-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full flex justify-between items-center p-0">
                      <CardTitle>Reference Solution</CardTitle>
                      {isReferenceSolutionExpanded ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="p-4 pt-0">
                    <div className="w-full min-h-[200px] border-2 border-gray-200 dark:border-gray-700 rounded-md p-2 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {problem.referenceSolution || 'No reference solution provided.'}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>

          <div>
            <ProfessorDisputeReviewSection
              assignmentId={params.assignmentId}
              problemId={params.problemId}
              submissionId={params.submissionId}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t w-full z-50">
        <NavigationBar
          currentIndex={currentIndex + 1}
          totalSubmissions={allSubmissions.length}
          onPrevious={() => navigateSubmission('prev')}
          onNext={() => navigateSubmission('next')}
          hasPrevious={!!adjacentSubmissionIds.prevId}
          hasNext={!!adjacentSubmissionIds.nextId}
          courseId={params.courseId}
          assignmentId={params.assignmentId}
          problemId={params.problemId}
          mode='professor-dispute-review'
        />
      </div>
    </div>
  )
}