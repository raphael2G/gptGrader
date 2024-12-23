'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/various/BackButton'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { submissionApi } from '@/app/lib/client-api/submissions'
import { userApi } from '@/app/lib/client-api/users'
import { IAssignment, IProblem } from '@@/models/Assignment'
import { ISubmission } from '@@/models/Submission'
import { IUser } from '@@/models/User'
import { useToast } from "@/components/ui/use-toast"
import { ProblemNavigation } from '@/components/dashboard/courses/ProblemNavigation'
import { Textarea } from "@/components/ui/textarea"
import { ProfessorDisputeReviewSection } from '@/components/rubrics/ProfessorDisputeReviewSection'
import { NavigationBar } from '@/components/dashboard/reviewingSubmissions/NavigationBar'
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from '@/components/ui/button'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'


export default function DiscrepancyReportPage({ 
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
  const [adjacentSubmissionIds, setAdjacentSubmissionIds] = useState<{ prevId: string | null, nextId: string | null }>({ prevId: null, nextId: null })
  const [isReferenceSolutionExpanded, setIsReferenceSolutionExpanded] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [assignmentResponse, submissionResponse, totalSubmissionsResponse] = await Promise.all([
          assignmentApi.getAssignmentById(params.assignmentId),
          submissionApi.getSubmissionByAssignmentProblemAndStudent(params.assignmentId, params.problemId, '1'),
          submissionApi.getSubmissionsByAssignmentId(params.assignmentId)
        ])

        if (assignmentResponse.data && submissionResponse.data && totalSubmissionsResponse.data) {
          setAssignment(assignmentResponse.data)
          setSubmission(submissionResponse.data)
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

          const submissions = totalSubmissionsResponse.data;
          const currentIndex = submissions.findIndex(s => s._id === params.submissionId);
          setCurrentSubmissionIndex(currentIndex + 1)

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
        router.push(`/manage-courses/${params.courseId}/discrepancy-reports/${params.assignmentId}/${params.problemId}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params, router, toast])

  const navigateSubmission = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && adjacentSubmissionIds.prevId) {
      router.push(`/manage-courses/${params.courseId}/discrepancy-reports/${params.assignmentId}/${params.problemId}/${adjacentSubmissionIds.prevId}`)
    } else if (direction === 'next' && adjacentSubmissionIds.nextId) {
      router.push(`/manage-courses/${params.courseId}/discrepancy-reports/${params.assignmentId}/${params.problemId}/${adjacentSubmissionIds.nextId}`)
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
          <BackButton backLink={`/manage-courses/${params.courseId}/discrepancy-reports/${params.assignmentId}/${params.problemId}`} />
          <div>
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">{assignment.title} - Problem {problem.id}</h2>
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
                      {isReferenceSolutionExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
              problem={problem}
              submission={submission}
              studentId={submission.studentId}
              onSubmissionUpdate={(updatedSubmission) => {
                setSubmission(updatedSubmission);
                toast({
                  title: 'Success',
                  description: 'Discrepancy resolved and submission updated.',
                });
              }}
            />
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
          courseId={params.courseId}
          assignmentId={params.assignmentId}
          problemId={params.problemId}
        />
      </div>
    </div>
  )
}

