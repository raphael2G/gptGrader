'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BackButton } from '@/components/various/BackButton'
import { userApi } from '@/app/lib/client-api/users'
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { submissionApi } from '@/app/lib/client-api/submissions'
import { IUser } from '@@/models/User'
import { IAssignment, IProblem, IRubricItem } from '@@/models/Assignment'
import { ISubmission } from '@@/models/Submission'
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CollapsibleQuestionScoreChart } from '@/components/dashboard/students/CollapsibleQuestionScoreChart'

interface QuestionScore {
  questionNumber: number;
  score: number;
  maxPoints: number;
}

export default function StudentAssignmentPerformancePage({ 
  params 
}: { 
  params: { courseId: string, studentId: string, assignmentId: string } 
}) {
  const [student, setStudent] = useState<IUser | null>(null)
  const [assignment, setAssignment] = useState<IAssignment | null>(null)
  const [submissions, setSubmissions] = useState<ISubmission[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [studentResponse, assignmentResponse] = await Promise.all([
          userApi.getUserById(params.studentId),
          assignmentApi.getAssignmentById(params.assignmentId),
        ])

        if (studentResponse.data) {
          setStudent(studentResponse.data)
        } else {
          throw new Error(studentResponse.error?.error || 'Failed to fetch student data')
        }

        if (assignmentResponse.data) {
          setAssignment(assignmentResponse.data)
          
          // Fetch submissions for each problem
          const submissionPromises = assignmentResponse.data.problems.map(problem => 
            submissionApi.getSubmissionByAssignmentProblemAndStudent(params.assignmentId, problem.id, params.studentId)
          )
          const submissionResponses = await Promise.all(submissionPromises)
          const fetchedSubmissions = submissionResponses
            .map(response => response.data)
            .filter((submission): submission is ISubmission => submission !== null)
          
          setSubmissions(fetchedSubmissions)
        } else {
          throw new Error(assignmentResponse.error?.error || 'Failed to fetch assignment data')
        }

      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          variant: "destructive",
        })
        router.push(`/manage-courses/${params.courseId}/students/${params.studentId}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.courseId, params.studentId, params.assignmentId, router, toast])

  if (loading) {
    return <div>Loading assignment data...</div>
  }

  if (!student || !assignment) {
    return <div>Student or assignment not found.</div>
  }

  const currentProblem: IProblem | undefined = assignment.problems[currentQuestionIndex]
  const currentSubmission = submissions.find(s => s.problemId === currentProblem?.id)

  const navigateQuestion = (direction: 'prev' | 'next') => {
    let newIndex = currentQuestionIndex
    if (direction === 'prev' && currentQuestionIndex > 0) {
      newIndex = currentQuestionIndex - 1
    } else if (direction === 'next' && currentQuestionIndex < assignment.problems.length - 1) {
      newIndex = currentQuestionIndex + 1
    }
    setCurrentQuestionIndex(newIndex)
  }

  const calculateEarnedPoints = (appliedRubricItemIds: string[] = []): number => {
    return currentProblem?.rubric
      .filter(item => appliedRubricItemIds.includes(item.id))
      .reduce((sum, item) => sum + item.points, 0) || 0;
  }

  const calculateQuestionScores = (): QuestionScore[] => {
    if (!assignment) return [];
    return assignment.problems.map((problem, index) => {
      const submission = submissions.find(s => s.problemId === problem.id);
      const score = submission
        ? problem.rubric
            .filter(item => submission.appliedRubricItemIds.includes(item.id))
            .reduce((sum, item) => sum + item.points, 0)
        : 0;
      return {
        questionNumber: index + 1,
        score: score,
        maxPoints: problem.maxPoints
      };
    });
  };

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex gap-6">
        <CollapsibleQuestionScoreChart
          scores={calculateQuestionScores()}
          onQuestionClick={setCurrentQuestionIndex}
          currentQuestionIndex={currentQuestionIndex}
        />
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>{assignment.title}</CardTitle>
            <p className="text-sm text-muted-foreground">Student: {student.name}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Button
                  onClick={() => navigateQuestion('prev')}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  size="icon"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>
                  Question {currentQuestionIndex + 1} of {assignment.problems.length}
                </span>
                <Button
                  onClick={() => navigateQuestion('next')}
                  disabled={currentQuestionIndex === assignment.problems.length - 1}
                  variant="outline"
                  size="icon"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              {currentProblem && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Question:</h3>
                    <p>{currentProblem.question}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Student's Response:</h3>
                    <pre className="whitespace-pre-wrap">{currentSubmission?.answer || 'No answer provided'}</pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="w-1/3">
          <CardHeader>
            <CardTitle>Rubric & Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Rubric:</h3>
                  <ul className="space-y-2">
                    {currentProblem?.rubric.map((item) => {
                      const isApplied = currentSubmission?.appliedRubricItemIds.includes(item.id);
                      const isPositive = item.points >= 0;
                      return (
                        <li
                          key={item.id}
                          className={`p-2 rounded-lg flex items-center justify-between ${
                            isApplied
                              ? isPositive
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-100 border-2 border-green-500'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-100 border-2 border-red-500'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {isApplied && (
                              isPositive 
                                ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                                : <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span>{item.description}</span>
                          </div>
                          <Badge 
                            variant={isPositive ? 'default' : 'destructive'}
                            className={isPositive ? 'bg-green-500' : 'bg-red-500'}
                          >
                            {item.points > 0 ? '+' : ''}{item.points}
                          </Badge>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Points:</h3>
                  <p>
                    {calculateEarnedPoints(currentSubmission?.appliedRubricItemIds)} / {currentProblem?.maxPoints || 0}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Feedback:</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentSubmission?.feedback || 'No feedback provided.'}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Grading Status:</h3>
                  <p>{currentSubmission?.graded ? 'Graded' : 'Not graded'}</p>
                  {currentSubmission?.graded && (
                    <>
                      <p>Graded by: {currentSubmission.gradedBy}</p>
                      <p>Graded at: {currentSubmission.gradedAt?.toLocaleString()}</p>
                    </>
                  )}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
