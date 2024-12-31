'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BackButton } from '@/components/various/BackButton'
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { RubricSection } from '@/components/various/RubricSection'
import { useGetAssignmentById, useUpdateAssignment, useUpsertProblem, useUpsertRubricItem} from '@/hooks/queries/useAssignments'

interface LLMAnalysisResult {
  commonCorrectThings: string[];
  commonMistakes: string[];
}

export default function MakeRubricPage({ 
  params 
}: { 
  params: { courseId: string, assignmentId: string, problemId: string } 
}) {
  // States
  const [llmLoading, setLlmLoading] = useState(false)
  const [llmAnalysis, setLlmAnalysis] = useState<LLMAnalysisResult | null>(null)
  const [generatingRubric, setGeneratingRubric] = useState(false)

  // Hooks
  const router = useRouter()
  const { toast } = useToast()

  // React Query hooks
  const { 
    data: assignment, 
    isLoading: assignmentLoading,
    error: assignmentError
  } = useGetAssignmentById(params.assignmentId)

  const { mutate: upsertProblem } = useUpsertProblem()
  const { mutate: upsertRubricItem, isPending: upsertingRubricItem } = useUpsertRubricItem()

  // Derived state
  const problem = assignment?.problems.find(p => p._id?.toString() === params.problemId)
  const rubricItems = problem?.rubric?.items || []

  // Effects replacement - fetch LLM analysis when problem is available
  const fetchLlmAnalysis = async (problemId: string, referenceSolution: string) => {
    setLlmLoading(true)
    try {
      const response = await new Promise(resolve => setTimeout(() => {
        resolve({
          // Mock response structure to match what the API would return
          data: {
            success: true
          }
        });
      }, 5000)); // 5000 milliseconds = 5 seconds

    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to analyze submissions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLlmLoading(false)
    }
  }

  // If problem exists and has a reference solution, fetch LLM analysis
  if (problem && problem.referenceSolution && !llmAnalysis && !llmLoading) {
    fetchLlmAnalysis(problem._id?.toString() || '', problem.referenceSolution)
  }


  const handleSaveRubric = async () => {
    if (!problem) return

    upsertProblem(
      {
        assignmentId: params.assignmentId,
        problemData: {
          ...problem,
          rubric: {
            items: rubricItems
          },
          rubricFinalized: true
        }
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Rubric saved and finalized successfully.",
          })
          router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/calibrate-rubric`)
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to save rubric. Please try again.",
            variant: "destructive",
          })
        }
      }
    )
  }
  
  const handleGenerateRubric = async () => {
    if (!problem || !llmAnalysis || !assignment) return
    
    setGeneratingRubric(false)
    

  }

  // Loading states
  if (assignmentLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Error states
  if (assignmentError || !assignment) {
    toast({
      title: "Error",
      description: "Failed to fetch assignment data. Please try again.",
      variant: "destructive",
    })
    router.push(`/manage-courses/${params.courseId}/grading`)
    return null
  }

  if (!problem) {
    toast({
      title: "Error",
      description: "Problem not found.",
      variant: "destructive",
    })
    router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}`)
    return null
  }

  return (
    <div className="space-y-6 p-6">
      <BackButton backLink={`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/setup`} />
      <h1 className="text-3xl font-bold text-center">
        Create Rubric: {assignment.title}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Question</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{problem.question}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Reference Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{problem.referenceSolution || 'No reference solution provided.'}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>LLM Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {llmLoading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium text-primary">Our LLMs are analyzing student responses...</p>
            </div>
          ) : llmAnalysis ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Common Correct Things:</h3>
                <ul className="list-disc pl-5">
                  {llmAnalysis.commonCorrectThings.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Common Mistakes:</h3>
                <ul className="list-disc pl-5">
                  {llmAnalysis.commonMistakes.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p>Failed to load LLM analysis. Please try again.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Rubric</span>
            <Button onClick={handleGenerateRubric} disabled={generatingRubric || !llmAnalysis}>
              {generatingRubric ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Rubric'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RubricSection
            assignmentId={params.assignmentId}
            problemId={params.problemId}
          />
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSaveRubric}>
          Calibrate Rubric
        </Button>
      </div>
    </div>
  )
}