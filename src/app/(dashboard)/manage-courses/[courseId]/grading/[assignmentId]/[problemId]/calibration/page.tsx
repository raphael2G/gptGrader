'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BackButton } from '@/components/various/BackButton'
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { submissionApi } from '@/app/lib/client-api/submissions'
import { llmApi } from '@/app/lib/client-api/LLM'
import { IAssignment, IProblem, IRubricItem } from '@@/models/Assignment'
import { ISubmission } from '@@/models/Submission'
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Zap } from 'lucide-react'
import { QuestionDisplay } from '@/components/dashboard/reviewingSubmissions/QuestionDisplay'
import { StudentResponse } from '@/components/dashboard/reviewingSubmissions/StudentResponse'
import { RubricGrading } from '@/components/dashboard/reviewingSubmissions/RubricGrading'
import { NavigationBar } from '@/components/dashboard/reviewingSubmissions/NavigationBar'
import { CollapsibleQuestionScoreChart } from '@/components/dashboard/reviewingSubmissions/CollapsibleQuestionScoreChart'

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
  const [assignment, setAssignment] = useState<IAssignment | null>(null)
  const [problem, setProblem] = useState<IProblem | null>(null)
  const [submissions, setSubmissions] = useState<ISubmission[]>([])
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [aiGrading, setAiGrading] = useState<AIGradingResult | null>(null)
  const [isAiGrading, setIsAiGrading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const router = useRouter()
  const { toast } = useToast()
  const n = parseInt(searchParams.n as string) || 1; // Number of submissions to calibrate

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [assignmentResponse, submissionsResponse] = await Promise.all([
          assignmentApi.getAssignmentById(params.assignmentId),
          submissionApi.getSubmissionsByProblemId(params.problemId)
        ])

        if (assignmentResponse.data && submissionsResponse.data) {
          setAssignment(assignmentResponse.data)
          const foundProblem = assignmentResponse.data.problems.find(p => p.id === params.problemId)
          if (foundProblem) {
            setProblem(foundProblem)
          } else {
            throw new Error('Problem not found')
          }

          const sortedSubmissions = submissionsResponse.data.sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime());
          const sampledSubmissions = sampleSubmissions(sortedSubmissions, n);
          setSubmissions(sampledSubmissions);
        } else {
          throw new Error('Failed to fetch assignment or submissions data')
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
  }, [params.courseId, params.assignmentId, params.problemId, router, toast, n])

  const handleAIGrading = async () => {
    if (!problem || !submissions[currentSubmissionIndex]) return

    setIsAiGrading(true)
    try {
      const response = await llmApi.gradeSubmission(
        problem.id,
        submissions[currentSubmissionIndex].answer,
        problem.rubric
      )
      if (response.data) {
        setAiGrading(response.data)
        setFeedback(response.data.feedback)

        // Update the current submission with AI grading results
        setSubmissions(prevSubmissions => {
          const updatedSubmissions = [...prevSubmissions];
          updatedSubmissions[currentSubmissionIndex] = {
            ...updatedSubmissions[currentSubmissionIndex],
            appliedRubricItemIds: response.data.appliedRubricItemIds,
            feedback: response.data.feedback
          };
          return updatedSubmissions;
        });
      } else {
        throw new Error(response.error?.error || 'Failed to grade submission')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to grade submission. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAiGrading(false)
    }
  }

  const handleRubricChange = (appliedRubricItemIds: string[]) => {
    setSubmissions(prevSubmissions => {
      const updatedSubmissions = [...prevSubmissions];
      updatedSubmissions[currentSubmissionIndex] = {
        ...updatedSubmissions[currentSubmissionIndex],
        appliedRubricItemIds
      };
      return updatedSubmissions;
    });
  }

  const handleFeedbackChange = (newFeedback: string) => {
    setFeedback(newFeedback);
    setSubmissions(prevSubmissions => {
      const updatedSubmissions = [...prevSubmissions];
      updatedSubmissions[currentSubmissionIndex] = {
        ...updatedSubmissions[currentSubmissionIndex],
        feedback: newFeedback
      };
      return updatedSubmissions;
    });
  }

  const navigateSubmission = async (direction: 'prev' | 'next') => {
    if (direction === 'next' && currentSubmissionIndex === submissions.length - 1) {
      // Finalize rubric when navigating past the last submission
      try {
        const response = await assignmentApi.updateProblemRubricFinalization(params.assignmentId, params.problemId, true);
        if (response.data) {
          toast({
            title: "Success",
            description: "Rubric finalized! Returning to rubric creation steps.",
          });
          router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/setup`); // Redirect to setup page
        } else {
          throw new Error(response.error?.error || 'Failed to finalize rubric');
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to finalize rubric. Please try again.",
          variant: "destructive",
        });
      }
      return; // Prevent further navigation
    }

    // Normal navigation logic
    if (direction === 'prev' && currentSubmissionIndex > 0) {
      setCurrentSubmissionIndex(currentSubmissionIndex - 1);
    } else if (direction === 'next' && currentSubmissionIndex < submissions.length - 1) {
      setCurrentSubmissionIndex(currentSubmissionIndex + 1);
    }

    setAiGrading(null); // Reset AI grading state
  };

  const handleRubricItemEdit = async (itemId: string, newDescription: string, newPoints: number) => {
    if (!problem || !assignment) return;

    const updatedRubric = problem.rubric.map(item =>
      item.id === itemId ? { ...item, description: newDescription, points: newPoints } : item
    );

    try {
      const response = await assignmentApi.updateProblem(params.assignmentId, params.problemId, { rubric: updatedRubric });

      if (response.data) {
        setAssignment(prevAssignment => ({
          ...prevAssignment!,
          problems: prevAssignment!.problems.map(p =>
            p.id === params.problemId ? { ...p, rubric: updatedRubric } : p
          )
        }));

        // Update the problem state
        setProblem(prevProblem => ({
          ...prevProblem!,
          rubric: updatedRubric
        }));

        toast({
          title: "Success",
          description: "Rubric item updated successfully.",
        });
      } else {
        throw new Error(response.error?.error || 'Failed to update rubric item');
      }
    } catch (err) {
      console.error("Error updating rubric item:", err);
      toast({
        title: "Error",
        description: "Failed to update rubric item. Please try again.",
        variant: "destructive",
      });
    }
  };


  const handleAIFeedback = async (itemId: string, feedback: string, shouldApply: 'should' | 'should-not') => {
    console.log(`AI Feedback for item ${itemId}: ${feedback} (Should apply: ${shouldApply})`);
    toast({
      title: "AI Feedback Received",
      description: "Your feedback has been recorded.",
    });
  };

  if (loading) {
    return <div>Loading calibration data...</div>
  }

  if (!assignment || !problem || submissions.length === 0) {
    return <div>Required data not found.</div>
  }

  const currentSubmission = submissions[currentSubmissionIndex];

  const questionScores = submissions.map((submission, index) => ({
    questionNumber: index + 1,
    score: submission.appliedRubricItemIds.reduce((sum, itemId) => {
      const rubricItem = problem.rubric.find(item => item.id === itemId);
      return sum + (rubricItem ? rubricItem.points : 0);
    }, 0),
    maxPoints: problem.maxPoints
  }));

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-grow overflow-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <BackButton backLink={`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/setup`} />
        </div>
        <div className="bg-card text-card-foreground rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold text-primary mb-2">Calibrate Rubric: {assignment.title}</h2>
          <p className="text-muted-foreground">
            Submission {currentSubmissionIndex + 1} of {submissions.length}
          </p>
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
                <StudentResponse response={currentSubmission.answer} />
              </CardContent>
            </Card>
          </div>
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
                <RubricGrading
                  rubric={problem.rubric}
                  appliedRubricItemIds={currentSubmission.appliedRubricItemIds}
                  onRubricChange={handleRubricChange}
                  onRubricItemEdit={handleRubricItemEdit} 
                  onAIFeedback={handleAIFeedback}
                  feedback={currentSubmission.feedback || ''}
                  onFeedbackChange={handleFeedbackChange}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t w-full z-50">
        <NavigationBar
          currentIndex={currentSubmissionIndex + 1}
          totalSubmissions={submissions.length}
          onPrevious={() => navigateSubmission('prev')}
          onNext={() => navigateSubmission('next')}
          hasPrevious={currentSubmissionIndex > 0}
          hasNext={currentSubmissionIndex < submissions.length - 1}
          courseId={params.courseId}
          assignmentId={params.assignmentId}
          problemId={params.problemId}
        />
      </div>
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

