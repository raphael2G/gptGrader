'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { BackButton } from '@/components/various/BackButton'
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { submissionApi } from '@/app/lib/client-api/submissions'
import { userApi } from '@/app/lib/client-api/users'
import { IAssignment, IProblem } from '@@/models/Assignment'
import { ISubmission } from '@@/models/Submission'
import { IUser } from '@@/models/User'
import { useToast } from "@/components/ui/use-toast"
import { QuestionDisplay } from '@/components/dashboard/reviewingSubmissions/QuestionDisplay'
import { StudentResponse } from '@/components/dashboard/reviewingSubmissions/StudentResponse'
import { RubricGrading } from '@/components/dashboard/reviewingSubmissions/RubricGrading'
import { NavigationBar } from '@/components/dashboard/reviewingSubmissions/NavigationBar'
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Save } from 'lucide-react'

export default function GradeSubmissionPage({ 
  params 
}: { 
  params: { courseId: string, assignmentId: string, problemId: string, submissionId: string } 
}) {
  const [assignment, setAssignment] = useState<IAssignment | null>(null)
  const [problem, setProblem] = useState<IProblem | null>(null)
  const [submission, setSubmission] = useState<ISubmission | null>(null)
  const [student, setStudent] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalSubmissions, setTotalSubmissions] = useState(0)
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [adjacentSubmissionIds, setAdjacentSubmissionIds] = useState<{ prevId: string | null; nextId: string | null }>({ prevId: null, nextId: null });
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [assignmentResponse, submissionResponse, totalSubmissionsResponse] = await Promise.all([
          assignmentApi.getAssignmentById(params.assignmentId),
          submissionApi.getSubmissionById(params.submissionId),
          submissionApi.getSubmissionsByAssignmentId(params.assignmentId)
        ])

        if (assignmentResponse.data && submissionResponse.data && totalSubmissionsResponse.data) {
          setAssignment(assignmentResponse.data)
          setSubmission(submissionResponse.data)
          setFeedback(submissionResponse.data.feedback || '')
          setTotalSubmissions(totalSubmissionsResponse.data.length)
          
          const foundProblem = assignmentResponse.data.problems.find(p => p.id === params.problemId)
          if (foundProblem) {
            setProblem(foundProblem)
          } else {
            throw new Error('Problem not found')
          }

          const studentResponse = await userApi.getUserById(submissionResponse.data.studentId)
          if (studentResponse.data) {
            setStudent(studentResponse.data)
          } else {
            throw new Error('Failed to fetch student data')
          }

          // Calculate current submission index
          const index = totalSubmissionsResponse.data.findIndex(s => s._id === params.submissionId)
          setCurrentSubmissionIndex(index + 1)

          //Fetch adjacent submissions
          const submissions = totalSubmissionsResponse.data;
          const currentIndex = submissions.findIndex(s => s._id === params.submissionId);
          setAdjacentSubmissionIds({
            prevId: currentIndex > 0 ? submissions[currentIndex - 1]._id : null,
            nextId: currentIndex < submissions.length - 1 ? submissions[currentIndex + 1]._id : null,
          });
        } else {
          throw new Error('Failed to fetch necessary data')
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          variant: "destructive",
        })
        router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params, router, toast])

  const handleRubricChange = (appliedRubricItemIds: string[]) => {
    if (submission) {
      setSubmission({ ...submission, appliedRubricItemIds })
    }
  }

  const handleFeedbackChange = (newFeedback: string) => {
    setFeedback(newFeedback)
    if (submission) {
      setSubmission({ ...submission, feedback: newFeedback })
    }
  }

  const navigateSubmission = (direction: 'prev' | 'next') => {
    // TODO: Implement navigation logic
    if (direction === 'prev' && adjacentSubmissionIds.prevId) {
      router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/graded/${adjacentSubmissionIds.prevId}`)
    } else if (direction === 'next' && adjacentSubmissionIds.nextId) {
      router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/graded/${adjacentSubmissionIds.nextId}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!assignment || !problem || !submission || !student) {
    return <div className="text-center text-red-500">Required data not found.</div>
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-grow overflow-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <BackButton backLink={`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}`} />
        </div>
        <div className="bg-card text-card-foreground rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold text-primary mb-2">Assignment: {assignment.title}</h2>
          <Progress value={(currentSubmissionIndex / totalSubmissions) * 100} className="h-2" />
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
                <RubricGrading 
                  rubric={problem.rubric} 
                  appliedRubricItemIds={submission.appliedRubricItemIds}
                  onRubricChange={handleRubricChange}
                  feedback={feedback}
                  onFeedbackChange={handleFeedbackChange}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t w-full z-50">
        <NavigationBar 
          currentIndex={currentSubmissionIndex}
          totalSubmissions={totalSubmissions}
          onPrevious={() => navigateSubmission('prev')}
          onNext={() => navigateSubmission('next')}
          hasPrevious={!!adjacentSubmissionIds.prevId}
          hasNext={!!adjacentSubmissionIds.nextId}
        />
      </div>
    </div>
  )
}

