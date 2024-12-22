'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BackButton } from '@/components/various/BackButton'
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { llmApi } from '@/app/lib/client-api/LLM'
import { IAssignment, IProblem, IRubricItem } from '@@/models/Assignment'
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { RubricSection } from '@/components/various/RubricSection'

interface LLMAnalysisResult {
  commonCorrectThings: string[];
  commonMistakes: string[];
}

export default function MakeRubricPage({ 
  params 
}: { 
  params: { courseId: string, assignmentId: string, problemId: string } 
}) {
  const [assignment, setAssignment] = useState<IAssignment | null>(null)
  const [problem, setProblem] = useState<IProblem | null>(null)
  const [loading, setLoading] = useState(true)
  const [llmLoading, setLlmLoading] = useState(false)
  const [llmAnalysis, setLlmAnalysis] = useState<LLMAnalysisResult | null>(null)
  const [rubricItems, setRubricItems] = useState<IRubricItem[]>([])
  const [generatingRubric, setGeneratingRubric] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const assignmentResponse = await assignmentApi.getAssignmentById(params.assignmentId)

        if (assignmentResponse.data) {
          setAssignment(assignmentResponse.data)
          const foundProblem = assignmentResponse.data.problems.find(p => p.id === params.problemId)
          if (foundProblem) {
            setProblem(foundProblem)
            setRubricItems(foundProblem.rubric || []) // Initialize rubricItems here
            await fetchLlmAnalysis(foundProblem)
          } else {
            throw new Error('Problem not found')
          }
        } else {
          throw new Error('Failed to fetch assignment data')
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          variant: "destructive",
        })
        router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/makeRubric`) // Redirect to makeRubric if error
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.courseId, params.assignmentId, params.problemId, router, toast])

  const fetchLlmAnalysis = async (problem: IProblem) => {
    setLlmLoading(true)
    try {
      const response = await llmApi.analyzeSubmissions(problem.id, problem.referenceSolution || '')
      if (response.data) {
        setLlmAnalysis(response.data)
      } else {
        throw new Error(response.error?.error || 'Failed to analyze submissions')
      }
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

  const handleRubricChange = (newRubricItems: IRubricItem[]) => {
    // Immediately update local state for responsive UI
    setRubricItems(newRubricItems);

    // Update the assignment in the database with correct structure
    if (problem) {
      assignmentApi.updateProblem(
        params.assignmentId, 
        params.problemId, 
        { 
          rubric: { 
            items: newRubricItems 
          }
        }
      )
        .then(res => {
          if (res.data) {
            // Update the full assignment state while preserving the local rubric state
            setAssignment(prevAssignment => {
              if (!prevAssignment) return res.data;
              
              return {
                ...res.data,
                problems: res.data.problems.map(p => {
                  if (p._id === problem._id) {
                    return {
                      ...p,
                      rubric: { items: newRubricItems }
                    };
                  }
                  return p;
                })
              };
            });
          }
        })
        .catch(err => {
          // On error, revert the local state
          setRubricItems(problem.rubric);
          console.error("Failed to update rubric:", err);
          toast({
            title: "Error",
            description: "Failed to update rubric. Please try again.",
            variant: "destructive",
          });
        });
    }
  }

  const handleSaveRubric = async () => {
    if (!problem) return

    try {
      const updatedProblem = { ...problem, rubric: rubricItems, rubricFinalized: true }
      const response = await assignmentApi.updateProblem(params.assignmentId, params.problemId, updatedProblem)
      
      if (response.data) {
        toast({
          title: "Success",
          description: "Rubric saved and finalized successfully.",
        })
        router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/calibrate-rubric`)
      } else {
        throw new Error(response.error?.error || 'Failed to save rubric')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save rubric. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateRubric = async () => {
    if (!problem || !llmAnalysis || !assignment) return; // Add assignment check

    setGeneratingRubric(true);
    try {
      const response = await llmApi.generateRubric(
        problem.id,
        problem.question,
        problem.referenceSolution || '',
        llmAnalysis.commonCorrectThings,
        llmAnalysis.commonMistakes
      );

      if (response.data) {
        const generatedRubricItems: IRubricItem[] = response.data.rubricItems.map(item => ({
          id: `generated-${Date.now()}-${Math.random()}`,
          description: item.description,
          points: item.points
        }));

        // Update both state and database
        setRubricItems(generatedRubricItems);

        const updatedAssignment = await assignmentApi.updateProblem(
          params.assignmentId,
          params.problemId,
          { rubric: generatedRubricItems }
        );
        if (updatedAssignment.data) {
          toast({
            title: "Success",
            description: "Rubric generated successfully.",
          });
        } else {
          throw new Error('Failed to update assignment with generated rubric')
        }
      } else {
        throw new Error(response.error?.error || 'Failed to generate rubric');
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate rubric. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingRubric(false);
    }
  };

  if (loading) {
    return <div>Loading rubric creation data...</div>
  }

  if (!assignment || !problem) {
    return <div>Problem not found.</div>
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
            rubricItems={rubricItems}
            onUpdateRubric={handleRubricChange}
          ></RubricSection>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={() => router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/calibrate-rubric`)}>
          Calibrate Rubric
        </Button>
      </div>
    </div>
  )
}

