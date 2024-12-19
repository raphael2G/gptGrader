'use client'

import { useState, useEffect } from 'react'
import { notFound, redirect } from 'next/navigation'
import { BackButton } from '@/components/dashboard/BackButton'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import dynamic from 'next/dynamic'
import { UserAuth } from '@/contexts/AuthContext'
import { assignmentApi } from '@/api-client/endpoints/assignments'
import { IAssignment, IProblem } from '@/models/Assignment'
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
import { RubricSidebar } from '@/components/dashboard/RubricSidebar'

const Confetti = dynamic(() => import('react-confetti'), { ssr: false })

export default function AssignmentPage({ params }: { params: { courseId: string, assignmentId: string } }) {
  const [assignment, setAssignment] = useState<IAssignment | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showConfetti, setShowConfetti] = useState(false)
  const [showOverdueAlert, setShowOverdueAlert] = useState(false)
  const [showRubric, setShowRubric] = useState(false)
  const { toast } = useToast()
  const { user } = UserAuth()

  useEffect(() => {
    if (!user) {
      redirect('/login')
    }
  }, [user])

  useEffect(() => {
    const fetchAssignment = async () => {
      const { data, error } = await assignmentApi.getAssignmentById(params.assignmentId)
      if (error) {
        toast({
          title: "Error",
          description: error.error,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
      if (data) {
        setAssignment(data)
        if (data.problems.length > 0) {
          setSelectedProblemId(data.problems[0]._id?.toString() ?? null)
        }
        setIsLoading(false)
      }
    }
    fetchAssignment()
  }, [params.assignmentId])

  if (isLoading || !selectedProblemId) {
    return <div>Is Loading...</div>
  }

  if (!assignment) {
    return notFound()
  }

  const selectedProblem = selectedProblemId 
    ? assignment.problems.find(p => p._id?.toString() === selectedProblemId)
    : null

  const currentProblemIndex = selectedProblem
    ? assignment.problems.findIndex(p => p._id?.toString() === selectedProblem._id?.toString())
    : -1

  const isOverdue = new Date(assignment.dueDate) < new Date()
  const isSubmissionClosed = new Date(assignment.lateDueDate) < new Date()
  const isReleased = assignment.status === 'released'

  const handleSubmit = async () => {
    if (!selectedProblem || !user?._id) return

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
      await submitAnswer()
    }
  }

  const submitAnswer = async () => {
    if (!selectedProblem || !user?._id) return

    try {
      // TODO: Implement submission API endpoint
      // const { data, error } = await submissionApi.submit({
      //   assignmentId: assignment._id!.toString(),
      //   problemId: selectedProblem._id!.toString(),
      //   studentId: user._id,
      //   answer: answers[selectedProblem._id!.toString()] || '',
      // })

      toast({
        title: "Success!",
        variant: "success",
        description: isOverdue ? "Your late answer has been submitted successfully." : "Your answer has been submitted successfully.",
      })

      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
      setShowOverdueAlert(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive",
      })
    }
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
      setSelectedProblemId(assignment.problems[newIndex]._id?.toString() ?? null)
    }
  }

  return (
    <>
      {showConfetti && <Confetti numberOfPieces={500} recycle={false} />}
      <div className="space-y-6">
        <BackButton />
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
          <p className="text-xl">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
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
                  <SelectItem key={problem._id?.toString()} value={problem._id?.toString() ?? ''}>
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
                  {isReleased && selectedProblem.rubric && (
                    <Button
                      onClick={() => setShowRubric(prev => !prev)}
                      className="absolute top-2 right-2"
                      variant="outline"
                    >
                      {showRubric ? "Hide Rubric" : "Show Rubric"}
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder={isSubmissionClosed ? "Submissions are closed" : "Type your answer here..."}
                  value={answers[selectedProblem._id?.toString() ?? ''] || ''}
                  onChange={(e) => handleAnswerChange(selectedProblem._id?.toString() ?? '', e.target.value)}
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
                    {/* TODO: Implement last submission viewing once API is ready */}
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
                            Coming soon...
                          </DialogDescription>
                        </DialogHeader>
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

          {isReleased && selectedProblem?.rubric && (
            <RubricSidebar
              assignmentId={assignment?._id?.toString() ?? ''}
              problemId={selectedProblemId}
              isVisible={showRubric}
              maxPoints={10}
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