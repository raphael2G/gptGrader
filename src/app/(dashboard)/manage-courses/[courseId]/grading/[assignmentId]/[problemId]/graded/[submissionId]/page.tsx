'use client'

import { Card, CardContent } from "@/components/ui/card"
import { BackButton } from '@/components/various/BackButton'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { QuestionDisplay } from '@/components/dashboard/reviewingSubmissions/QuestionDisplay'
import { StudentResponse } from '@/components/dashboard/reviewingSubmissions/StudentResponse'
import { RubricGrading } from '@/components/dashboard/reviewingSubmissions/RubricGrading'
import { NavigationBar } from '@/components/dashboard/reviewingSubmissions/NavigationBar'
import { Progress } from "@/components/ui/progress"
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { UserAuth } from "@/contexts/AuthContext"

// Import our React Query hooks
import { useGetAssignmentById } from '@/hooks/queries/useAssignments'
import { 
  useGetSubmissionById, 
  useGetSubmissionsByAssignmentId,
  useGetSubmissionsByAssignmentIdAndProblemId,
  useUpdateSubmissionGrading 
} from '@/hooks/queries/useSubmissions'

export default function GradeSubmissionPage({ 
  params 
}: { 
  params: { courseId: string, assignmentId: string, problemId: string, submissionId: string } 
}) {
  // Local state for feedback (since this is UI state)
  const [feedback, setFeedback] = useState('')
  
  // Router and Toast
  const router = useRouter()
  const { toast } = useToast()
  const user = UserAuth().user


  // Fetch assignment data
  const { 
    data: assignment,
    isLoading: assignmentLoading,
    error: assignmentError
  } = useGetAssignmentById(params.assignmentId)

  // Fetch current submission
  const {
    data: submission,
    isLoading: submissionLoading,
    error: submissionError
  } = useGetSubmissionById(params.submissionId)

  // Fetch all submissions for this assignment (for navigation)
  const {
    data: allSubmissions = [],
    isLoading: allSubmissionsLoading,
    error: allSubmissionsError
  } = useGetSubmissionsByAssignmentIdAndProblemId(params.assignmentId, params.problemId)

  // Setup mutation for updating submission grading
  const { mutate: updateGrading } = useUpdateSubmissionGrading()


  // Find the current problem from the assignment
  const problem = assignment?.problems.find(p => p._id?.toString() === params.problemId)

  // Calculate submission navigation state
  const currentIndex = allSubmissions.findIndex(s => s._id?.toString() === params.submissionId)
  const adjacentSubmissionIds = {
    prevId: currentIndex > 0 ? allSubmissions[currentIndex - 1]._id : null,
    nextId: currentIndex < allSubmissions.length - 1 ? allSubmissions[currentIndex + 1]._id : null,
  }

  // Handle loading states
  const isLoading = assignmentLoading || submissionLoading || allSubmissionsLoading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Handle errors
  const error = assignmentError || submissionError || allSubmissionsError
  if (error || !assignment || !submission || !problem) {
    router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}`)
    return null
  }

  if (!user) {
    router.push(`/login`)
    return null
  }



  const navigateSubmission = (direction: 'prev' | 'next') => {
    const targetId = direction === 'prev' ? adjacentSubmissionIds.prevId : adjacentSubmissionIds.nextId
    if (targetId) {
      router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/graded/${targetId}`)
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-grow overflow-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <BackButton backLink={`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}`} />
        </div>
        
        <div className="bg-card text-card-foreground rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold text-primary mb-2">Assignment: {assignment.title}</h2>
          <Progress 
            value={((currentIndex + 1) / allSubmissions.length) * 100} 
            className="h-2" 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[65fr,35fr] gap-8">
          <div className="space-y-8">
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <QuestionDisplay question={problem.question} />
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <StudentResponse response={submission.answer} />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">Rubric</h3>
                <RubricGrading currentSubmission={submission} allowAiFeedback={true}/>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t w-full z-50">
        <NavigationBar 
          courseId={params.courseId}
          assignmentId={params.assignmentId}
          problemId={params.problemId}

          mode="viewing-graded"

          currentIndex={currentIndex + 1}
          totalSubmissions={allSubmissions.length}
          onPrevious={() => navigateSubmission('prev')}
          onNext={() => navigateSubmission('next')}
          hasPrevious={!!adjacentSubmissionIds.prevId}
          hasNext={!!adjacentSubmissionIds.nextId}
        />
      </div>
    </div>
  )
}