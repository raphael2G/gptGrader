import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CheckCircle, Circle, PenTool, Zap, Sliders, Check } from 'lucide-react'
import { ReferenceSolutionDialog } from '@/components/dashboard/grading/ReferenceSolutionDialog'
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter } from 'next/navigation';
import { useState } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { llmApi } from '@/app/lib/client-api/LLM' // Import llmApi
import { Loader2 } from 'lucide-react'

interface StepStatus {
  icon: React.ElementType;
  color: string;
}

const getStepStatus = (condition: boolean | string, colors: { incomplete: string; complete: string }): StepStatus => ({
  icon: condition ? CheckCircle : Circle,
  color: condition ? colors.complete : colors.incomplete
})

const getGradingStatus = (progress: number): StepStatus => {
  if (progress === 0) return { icon: Circle, color: 'text-gray-300' };
  if (progress === 1) return { icon: CheckCircle, color: 'text-green-500' };
  return { icon: Circle, color: 'text-yellow-500' };
}



interface GradingProcessStepsProp {
  assignmentId: string;
  problemId: string;
  questionNumber: number;
  referenceSolution?: string;
  hasRubric: boolean;
  isRubricFinalized: boolean;
  onReferenceSolutionUpdate: (newSolution: string) => void;
  onStartRubricCreation: () => void;
  courseId: string;
  params: {courseId: string, assignmentId: string, problemId: string};
  gradingProgress: number; // 0 to 1, representing the fraction of graded submissions
}

export function GradingProcessSteps({ 
  assignmentId, 
  problemId, 
  questionNumber, 
  referenceSolution, 
  hasRubric,
  isRubricFinalized,
  onReferenceSolutionUpdate,
  onStartRubricCreation,
  courseId,
  params,
  gradingProgress
}: GradingProcessStepsProp) {
  const router = useRouter();
  const [grading, setGrading] = useState(); 
  const { toast } = useToast();
  
  const steps = [
    {
      title: "Add Reference Solution",
      description: "Provide a reference solution for the problem.",
      icon: PenTool,
      status: getStepStatus(!!referenceSolution, { incomplete: 'text-gray-300', complete: 'text-green-500' })
    },
    {
      title: "Initial Rubric Generation",
      description: "Generate an initial rubric based on the reference solution.",
      icon: Zap,
      status: getStepStatus(
        isRubricFinalized ? 'finalized' : (hasRubric ? 'inProgress' : false),
        { incomplete: 'text-gray-300', complete: 'text-green-500' }
      )
    },
    {
      title: "Calibrate Rubric",
      description: "Fine-tune and calibrate the rubric for accuracy.",
      icon: Sliders,
      status: getStepStatus(isRubricFinalized, { incomplete: 'text-gray-300', complete: 'text-green-500' }),
      link: `/manage-courses/${courseId}/grading/${assignmentId}/${problemId}/calibration/setup`
    },
    {
      title: "Grade Submissions",
      description: "Grade all student submissions using the finalized rubric.",
      icon: Check,
      status: getGradingStatus(gradingProgress),
      link: `/manage-courses/${courseId}/grading/${assignmentId}/${problemId}/grade`
    },
  ]
  
  const handleGradeAllSubmissions = async () => {
    setGrading(true);

    try {
     
      const response = await llmApi.gradeAllSubmissions(problemId);
      if (response.data?.success) {
        toast({
          title: "Success",
          description: response.data.message || "Submissions graded successfully!",
        });
      } else {
        throw new Error(response.error?.error || "Failed to grade submissions");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to grade submissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGrading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Rubric Creation Process</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <step.status.icon className={`h-8 w-8 ${step.status.color}`} />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-medium flex items-center space-x-3">
                  <step.icon className="h-6 w-6" />
                  <span>{step.title}</span>
                </h3>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-300">{step.description}</p>
                {index === 0 && (
                  <div className="mt-4">
                    <ReferenceSolutionDialog
                      assignmentId={assignmentId}
                      problemId={problemId}
                      questionNumber={questionNumber}
                      initialSolution={referenceSolution}
                      onUpdate={onReferenceSolutionUpdate}
                    />
                  </div>
                )}
                {index === 1 && (
                  <div className="mt-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="w-full">
                            <Button 
                              onClick={referenceSolution ? onStartRubricCreation : undefined} 
                              variant={referenceSolution ? "default" : "secondary"}
                              className={`w-full ${!referenceSolution ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {hasRubric ? "View Rubric" : "Start Rubric Generation" }
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {!referenceSolution && (
                          <TooltipContent>
                            <p>Add a reference solution before creating the rubric</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                {index === 2 && (
                  <div className="mt-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="w-full">
                            <Button
                              onClick={() => router.push(step.link)}
                              disabled={!hasRubric}
                              variant={hasRubric ? "default" : "secondary"}
                              className={`w-full ${!hasRubric ? 'opacity-50 cursor-not-allowed' : ''}`}
                              
                            >
                              Calibrate Rubric
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {!hasRubric && (
                          <TooltipContent>
                            <p>You must create a rubric before you can calibrate it.</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                {index === 3 && (
                  <div className="mt-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="w-full">
                            <Button
                              onClick={handleGradeAllSubmissions}
                              disabled={!isRubricFinalized}
                              variant={isRubricFinalized ? "default" : "secondary"}
                              className={`w-full ${!isRubricFinalized ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {grading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Grading submissions... Please don't refresh the page.
                                  </>
                                ) : ("Grade Assignment")
                              }
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {!isRubricFinalized && (
                          <TooltipContent>
                            <p>You must calibrate the rubric before grading all submissions.</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
