'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BackButton } from '@/components/various/BackButton'
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Zap } from 'lucide-react'
import { QuestionDisplay } from '@/components/dashboard/reviewingSubmissions/QuestionDisplay'
import { StudentResponse } from '@/components/dashboard/reviewingSubmissions/StudentResponse'
import { RubricGrading } from '@/components/dashboard/reviewingSubmissions/RubricGrading'
import { NavigationBar } from '@/components/dashboard/reviewingSubmissions/NavigationBar'
import { CollapsibleQuestionScoreChart } from '@/components/dashboard/reviewingSubmissions/CollapsibleQuestionScoreChart'
import { useGetAssignmentById } from '@/hooks/queries/useAssignments'
import { useGetSubmissionsByProblemId } from '@/hooks/queries/useSubmissions'
import { useUpdateSubmissionGrading } from '@/hooks/queries/useSubmissions'
import { useUpsertProblem } from '@/hooks/queries/useAssignments'
import { ISubmission } from '@/models/Submission'
import { Types } from 'mongoose'
import { UserAuth } from '@/contexts/AuthContext'
import { analyzeApi } from '@/api-client/endpoints/analyze'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/hooks/queries/queryKeys'
import { useInvalidateSubmissions } from '@/hooks/queries/queryKeyInvalidation'

interface AIGradingResult {
  appliedRubricItemIds: string[];
  feedback: string;
}

export default function CalibrateRubricPage({
  params,
  searchParams
}: {
  params: { courseId: string, assignmentId: string, problemId: string },
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // States
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0)
  const [isAiGrading, setIsAiGrading] = useState(false)
  const [feedback, setFeedback] = useState('')
  
  // Hooks
  const router = useRouter()
  const { user } = UserAuth();
  const { toast } = useToast()
  const n = parseInt(searchParams.n as string) || 1
  const queryClient = useQueryClient();

  // React Query Hooks
  const { 
    data: assignment, 
    isLoading: assignmentLoading,
    error: assignmentError 
  } = useGetAssignmentById(params.assignmentId)

  const {
    data: submissions = [],
    isLoading: submissionsLoading,
    error: submissionsError
  } = useGetSubmissionsByProblemId(params.problemId)

  const { mutate: updateProblem } = useUpsertProblem()
  const { mutate: updateGrading, isPending: isGrading } = useUpdateSubmissionGrading();
  const invalidateSubmissions = useInvalidateSubmissions()

  // Find current problem
  const problem = assignment?.problems.find(p => p._id?.toString() === params.problemId)

  if (!user) {
    router.push("/login")
    return null
  }

  // Loading & Error States
  if (assignmentLoading || submissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (assignmentError || submissionsError || !assignment || !problem) {
    toast({
      title: "Error",
      description: "Failed to fetch data. Please try again.",
      variant: "destructive",
    })
    router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}`)
    return null
  }

  // Sort and sample submissions
  const sortedSubmissions = [...submissions].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  )
  const sampledSubmissions = sampleSubmissions(sortedSubmissions, n)
  const currentSubmission = sampledSubmissions[currentSubmissionIndex]

  if (!currentSubmission) {
    return <div>No submissions found.</div>
  }

  const handleAIGrading = async () => {
    if (!currentSubmission) return;
      
    try {
      setIsAiGrading(true);

      // Get AI grading results
      const response = await analyzeApi.gradeSubmission(currentSubmission._id.toString());
      
      if (!response.data) {
        throw new Error("No data received from AI grading");
      }

      toast({
        title: "Success",
        description: "Submission graded by AI successfully"
      });
  
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to calibrate with AI",
        variant: "destructive"
      });
    } finally {
      invalidateSubmissions({
        assignmentId: params.assignmentId, 
        problemId: params.problemId, 
        submissionId: currentSubmission._id.toString()
      })
      setIsAiGrading(false)
    }
  };


  const navigateSubmission = (direction: 'prev' | 'next') => {
    if (direction === 'next' && currentSubmissionIndex === sampledSubmissions.length - 1) {
      // Finalize rubric when navigating past the last submission
      router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/setup`);
      return;
    }

    // Normal navigation logic
    if (direction === 'prev' && currentSubmissionIndex > 0) {
      setCurrentSubmissionIndex(currentSubmissionIndex - 1);
    } else if (direction === 'next' && currentSubmissionIndex < sampledSubmissions.length - 1) {
      setCurrentSubmissionIndex(currentSubmissionIndex + 1);
    }

  };


  // Calculate scores for the chart
  const questionScores = sampledSubmissions.map((submission, index) => ({
    questionNumber: index + 1,
    score: (submission.appliedRubricItems || []).reduce((sum, itemId) => {
      const rubricItem = problem.rubric.items.find(item => item._id === itemId);
      return sum + (rubricItem ? rubricItem.points : 0);
    }, 0),
    maxPoints: problem.maxPoints
  }));

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-grow overflow-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <BackButton 
            backLink={`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/setup`} 
          />
        </div>
        
        <div className="bg-card text-card-foreground rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold text-primary mb-2">
            Calibrate Rubric: {assignment.title}
          </h2>
          <p className="text-muted-foreground">
            Submission {currentSubmissionIndex + 1} of {sampledSubmissions.length}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[55fr,45fr] gap-8">
          {/* Left Column - Question and Response */}
          <div className="space-y-8">
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <QuestionDisplay question={problem.question} />
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <StudentResponse response={currentSubmission.answer} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Rubric and Grading */}
          <div>
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-primary">Rubric</h3>
                  <Button
                    onClick={handleAIGrading}
                    disabled={isAiGrading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                  >
                    {isAiGrading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Calibrating...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Calibrate AI
                      </>
                    )}
                  </Button>
                </div>

                <RubricGrading currentSubmission={currentSubmission} allowRubricEdit={true} allowAiFeedback={true}/>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t w-full z-50">
        <NavigationBar
          currentIndex={currentSubmissionIndex + 1}
          totalSubmissions={sampledSubmissions.length}
          onPrevious={() => navigateSubmission('prev')}
          onNext={() => navigateSubmission('next')}
          hasPrevious={currentSubmissionIndex > 0}
          hasNext={currentSubmissionIndex < sampledSubmissions.length - 1}
          courseId={params.courseId}
          assignmentId={params.assignmentId}
          problemId={params.problemId}
          mode="calibration"
        />
      </div>

      {/* Score Chart */}
      <div className="fixed left-0 top-1/2 transform -translate-y-1/2">
        <CollapsibleQuestionScoreChart
          scores={questionScores}
          onQuestionClick={(index) => setCurrentSubmissionIndex(index)}
          currentQuestionIndex={currentSubmissionIndex}
        />
      </div>
    </div>
  )
}

function sampleSubmissions(submissions: ISubmission[], n: number): ISubmission[] {
  if (submissions.length <= n) {
    return submissions;
  }

  const sampledSubmissions: ISubmission[] = [];
  const interval = Math.floor(submissions.length / n);

  for (let i = 0; i < n; i++) {
    const index = i * interval;
    sampledSubmissions.push(submissions[index]);
  }

  return sampledSubmissions;
}