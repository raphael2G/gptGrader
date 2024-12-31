'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import Link from 'next/link'
import { ProblemNavigation } from './ProblemNavigation'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useGetAssignmentById } from '@/hooks/queries/useAssignments'
import { useUpsertSubmission } from '@/hooks/queries/useSubmissions'
import { useGetSubmissionsByStudentIdAssignmentIdAndProblemId } from '@/hooks/queries/useSubmissions'
import { UserAuth } from '@/contexts/AuthContext'



interface ProblemViewProps {
  courseId: string
  assignmentId: string
  problemId: string
}

export function ProblemView({ courseId, assignmentId, problemId }: ProblemViewProps) {
  const user = UserAuth().user;

  
  // Hooks
  const router = useRouter()
  const { toast } = useToast()

  // Queries
  const {
    data: assignment,
    isLoading: assignmentLoading,
    error: assignmentError
  } = useGetAssignmentById(assignmentId)

  const {
    data: submission,
    isLoading: submissionLoading,
    error: submissionError
  } = useGetSubmissionsByStudentIdAssignmentIdAndProblemId(user?._id.toString() || "", assignmentId, problemId, {enabled: !!user?._id})

  // Mutations
  const { 
    mutate: upsertSubmission,
    isPending: isSubmitting 
  } = useUpsertSubmission()

  // State
  const [lastSubmissionDialogOpen, setLastSubmissionDialogOpen] = useState(false)

  // we want the answer to initially be set to the last submission, but only if the answer is empty and has not been initialized yet
  const [answer, setAnswer] = useState(submission?.answer || '')
  const [isInitialized, setIsInitialized] = useState(false)
  useEffect(() => {
    if (submission && !isInitialized) {
      setAnswer(submission.answer)
      setIsInitialized(true)
    }
  }, [submission, submissionLoading])

  // Derived state
  const isLoading = assignmentLoading || submissionLoading
  const error = assignmentError || submissionError
  const currentDate = new Date()
  const dueDate = assignment?.dueDate ? new Date(assignment.dueDate) : null
  const isPastDue = dueDate ? currentDate > dueDate : false

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Error state
  if (error || !assignment) {
    toast({
      title: 'Error',
      description: 'Failed to load problem details',
      variant: 'destructive'
    })
    return null
  }

  // Find current problem
  const problem = assignment.problems.find(p => p._id.toString() === problemId)
  if (!problem) return null

  // Get assignment status
  const getAssignmentStatus = () => {
    if (currentDate < dueDate!) {
      return {
        status: "Accepting Submissions",
        color: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200'
      }
    } 
    if (!assignment.areGradesReleased) {
      return {
        status: "Not Graded",
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200'
      }
    }
    // need to come up with good self grading logic
    if (!submission?.selfGraded) {
      return {
        status: "Need Self Grade",
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200'
      }
    }
    return {
      status: "Graded",
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-200'
    }
  }

  const { status, color } = getAssignmentStatus()

  // Handlers
  const handleSubmit = async () => {
    try {

      await upsertSubmission({
        studentId: user?._id?.toString() || "",
        assignmentId,
        problemId,
        answer
      })

      
      toast({
        title: submission ? 'Submission Updated' : 'Submission Created',
        description: `Your submission has been ${submission ? 'updated' : 'created'}.`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="flex gap-6">
      {/* Problem Navigation */}
      <ProblemNavigation
        assignmentId={assignmentId}
        studentId={user?._id.toString() || ""}
      />

      {/* Main Content */}
      <div className="flex-grow space-y-6">
        {/* Assignment Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
          <p className="text-xl">Due: {dueDate?.toLocaleDateString()}</p>
          <p className="text-lg">{assignment.description}</p>
        </div>

        {/* Problem Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              Problem {assignment.problems.findIndex(p => p._id.toString() === problemId) + 1}
            </CardTitle>
            <div className="flex gap-2">
              <Badge className={color}>{status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold mb-4">{problem.question}</p>
            
            {/* Answer Input */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={isPastDue ? 'cursor-not-allowed' : ''}>
                    <Textarea
                      placeholder={isPastDue ? "Submission closed" : "Enter your answer here..."}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className={cn(
                        "w-full min-h-[200px] border-2 border-gray-200 dark:border-gray-700 rounded-md p-2",
                        isPastDue && "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                      )}
                      disabled={isPastDue}
                    />
                  </div>
                </TooltipTrigger>
                {isPastDue && (
                  <TooltipContent>
                    <p>It is past the due date. Submissions are closed.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </CardContent>

          {/* Actions */}
          <CardContent className="pt-0">
            <div className="flex justify-center items-center space-x-4 mt-2">
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setLastSubmissionDialogOpen(true)
                }}
                className="text-sm text-muted-foreground hover:underline focus:underline"
              >
                View Last Submission
              </Link>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        onClick={handleSubmit}
                        disabled={isPastDue}
                        isLoading={isSubmitting}
                      >
                        {isPastDue ? "Submission Closed" : "Submit"}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {isPastDue && (
                    <TooltipContent>
                      <p>It is past the due date. Submissions are closed.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        {/* Last Submission Dialog */}
        <Dialog open={lastSubmissionDialogOpen} onOpenChange={setLastSubmissionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Last Submission</DialogTitle>
              {submission && (
                <DialogDescription>
                  Submitted at: {new Date(submission.submittedAt).toLocaleString()}
                </DialogDescription>
              )}
            </DialogHeader>
            <Textarea
              value={submission?.answer || 'No previous submission found.'}
              readOnly
              className="w-full h-64 mt-4"
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}