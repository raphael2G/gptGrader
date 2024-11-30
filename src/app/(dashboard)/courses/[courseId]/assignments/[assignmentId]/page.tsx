'use client'

import { useState, useEffect } from 'react'
import { getAssignment, getProblem, getRubric, isAssignmentReleased } from '@/lib/dummy/courses'
import { getLastSubmission, saveSubmission } from '@/lib/dummy/dummyDatabase'
import { notFound } from 'next/navigation'
import { BackButton } from '@/components/dashboard/BackButton'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import { RubricSidebar } from '@/components/dashboard/RubricSidebar'

import { UserAuth } from '@/contexts/AuthContext'
import { redirect } from 'next/navigation'

const Confetti = dynamic(() => import('react-confetti'), { ssr: false })

export default function AssignmentPage({ params }: { params: { courseId: string, assignmentId: string } }) {
  const assignment = getAssignment(params.courseId, params.assignmentId)
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showConfetti, setShowConfetti] = useState(false)
  const [showOverdueAlert, setShowOverdueAlert] = useState(false)
  const [showRubric, setShowRubric] = useState(false)
  const { toast } = useToast()

  const {user} = UserAuth();

  useEffect(() => {
    if (!user) {
      redirect('/login')
    }
  }, [user])

  useEffect(() => {
    if (assignment && assignment.problems.length > 0) {
      setSelectedProblemId(assignment.problems[0].id)
      // Load last submissions for all problems
      const loadedAnswers: Record<string, string> = {}
      assignment.problems.forEach(problem => {
        const lastSubmission = getLastSubmission(problem.id)
        if (lastSubmission) {
          loadedAnswers[problem.id] = lastSubmission.answer
        }
      })
      setAnswers(loadedAnswers)
    }
    // Reset rubric visibility when navigating away
    return () => setShowRubric(false)
  }, [assignment])

  if (!assignment) {
    notFound()
  }

  const selectedProblem = selectedProblemId 
    ? getProblem(params.courseId, params.assignmentId, selectedProblemId)
    : null

  const currentProblemIndex = selectedProblem
    ? assignment.problems.findIndex(p => p.id === selectedProblem.id)
    : -1

  const isOverdue = new Date(assignment.dueDate) < new Date()
  const isSubmissionClosed = new Date(assignment.finalSubmissionDeadline) < new Date()
  const isReleased = isAssignmentReleased(params.courseId, params.assignmentId)

  const handleSubmit = () => {
    if (!selectedProblem) return

    if (isSubmissionClosed) {
      toast({
        title: "Submission Closed",
        description: "This assignment is no longer accepting submissions.",
        variant: "destructive",
      })
      return
    }

    if (isOverdue) {
      setShowOverdueAlert(true)
    } else {
      submitAnswer()
    }
  }

  const submitAnswer = () => {
    if (!selectedProblem) return

    const answer = answers[selectedProblem.id] || ''
    saveSubmission(selectedProblem.id, answer)

    // Show success toast
    toast({
      title: "Success!",
      variant: "success",
      description: isOverdue ? "Your late answer has been submitted successfully." : "Your answer has been submitted successfully.",
    })

    // Show confetti
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 5000) // Hide confetti after 5 seconds

    setShowOverdueAlert(false)
  }

  const handleAnswerChange = (problemId: string, newAnswer: string) => {
    if (isSubmissionClosed) return
    setAnswers(prev => ({
      ...prev,
      [problemId]: newAnswer
    }))
  }

  const navigateProblem = (direction: 'prev' | 'next') => {
    if (!assignment) return

    const newIndex = direction === 'prev' ? currentProblemIndex - 1 : currentProblemIndex + 1
    if (newIndex >= 0 && newIndex < assignment.problems.length) {
      setSelectedProblemId(assignment.problems[newIndex].id)
    }
  }

  const toggleRubric = () => {
    setShowRubric(prev => !prev)
  }

  const rubric = selectedProblem ? getRubric(params.courseId, params.assignmentId, selectedProblem.id) : undefined
  const maxPoints = selectedProblem ? selectedProblem['maxPoints'] : undefined

  return (
    <>
        {showConfetti && 
        <Confetti 
            numberOfPieces={500}
            recycle={false}
        />
    }
    <div className="space-y-6">
      <BackButton />
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{assignment.title}</h1>
        <p className="text-xl">Due: {assignment.dueDate}</p>
        {isOverdue && !isSubmissionClosed && (
          <p className="text-yellow-500 font-semibold">This assignment is overdue</p>
        )}
        {isSubmissionClosed && (
          <p className="text-red-500 font-semibold">This assignment is no longer accepting submissions</p>
        )}
      </div>
      <div className="flex space-x-4">
        <div className={`space-y-4 transition-all duration-300 ease-in-out ${showRubric ? 'w-2/3' : 'w-full'}`}>
          <Select
            value={selectedProblemId || undefined}
            onValueChange={(value) => setSelectedProblemId(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a problem" />
            </SelectTrigger>
            <SelectContent>
              {assignment.problems.map((problem, index) => (
                <SelectItem key={problem.id} value={problem.id}>
                  Problem {index + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProblem && (
            <>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg relative">
                <h2 className="text-xl font-semibold mb-2">Question:</h2>
                <p>{selectedProblem.question}</p>
                {isReleased && rubric && (
                  <Button
                    onClick={toggleRubric}
                    className="absolute top-2 right-2"
                    variant="outline"
                  >
                    {showRubric ? "Hide Rubric" : "Show Rubric"}
                  </Button>
                )}
              </div>
              <Textarea
                placeholder={isSubmissionClosed ? "Submissions are closed" : "Type your answer here..."}
                value={isSubmissionClosed ? (getLastSubmission(selectedProblem.id)?.answer || '') : (answers[selectedProblem.id] || '')}
                onChange={(e) => handleAnswerChange(selectedProblem.id, e.target.value)}
                className="min-h-[200px]"
                disabled={isSubmissionClosed}
              />
              <div className="flex justify-between items-center">
                <Button
                  onClick={() => navigateProblem('prev')}
                  disabled={currentProblemIndex === 0}
                  variant="outline"
                  size="icon"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full sm:w-auto"
                    disabled={isSubmissionClosed}
                  >
                    Submit Answer
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="h-auto p-0">
                        <p className="text-sm text-muted-foreground">
                          View Last Submission
                        </p>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          Last Submitted Answer for Problem {currentProblemIndex + 1}
                        </DialogTitle>
                        <DialogDescription>
                          {getLastSubmission(selectedProblem.id)?.submissionTime.toLocaleString() || 'No submission yet'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {getLastSubmission(selectedProblem.id)?.answer || 'No answer has been submitted yet.'}
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Button
                  onClick={() => navigateProblem('next')}
                  disabled={currentProblemIndex === assignment.problems.length - 1}
                  variant="outline"
                  size="icon"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
        {isReleased && rubric && maxPoints && (
          <RubricSidebar
            rubric={rubric}
            isVisible={showRubric}
            maxPoints={maxPoints}
          />
        )}
      </div>
      <AlertDialog open={showOverdueAlert} onOpenChange={setShowOverdueAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Overdue Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              This homework is overdue. Submitting now will mark the assignment as late. Are you sure you still want to submit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={submitAnswer}>Submit Anyway</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </>

  )
}

