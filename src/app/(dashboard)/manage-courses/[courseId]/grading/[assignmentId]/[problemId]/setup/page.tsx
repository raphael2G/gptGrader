'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BackButton } from '@/components/various/BackButton'
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { IAssignment, IProblem } from '@@/models/Assignment'
import { useToast } from "@/components/ui/use-toast"
import { GradingProcessSteps } from '@/components/dashboard/grading/GradingProcessSteps'


export default function MakeRubricLandingPage({ 
  params 
}: { 
  params: { courseId: string, assignmentId: string, problemId: string } 
}) {
  const [assignment, setAssignment] = useState<IAssignment | null>(null)
  const [problem, setProblem] = useState<IProblem | null>(null)
  const [loading, setLoading] = useState(true)
  const [referenceSolution, setReferenceSolution] = useState<string | undefined>(undefined)
  const [questionNumber, setQuestionNumber] = useState<number>(0)
  const [hasRubric, setHasRubric] = useState(false)
  const [isRubricFinalized, setIsRubricFinalized] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [grading, setGrading] = useState(false)
  const [gradingMessage, setGradingMessage] = useState<string | null>(null)

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
            setReferenceSolution(foundProblem.referenceSolution)
            setQuestionNumber(assignmentResponse.data.problems.findIndex(p => p.id === params.problemId) + 1)
            setHasRubric(foundProblem.rubric.length > 0)
            setIsRubricFinalized(foundProblem.rubricFinalized || false)
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
        router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.courseId, params.assignmentId, params.problemId, router, toast])

  const handleStartRubricCreation = () => {
    router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/setup/make-rubric`)
  }

  const handleReferenceSolutionUpdate = (newSolution: string) => {
    setReferenceSolution(newSolution)
    if (problem) {
      setProblem({ ...problem, referenceSolution: newSolution })
    }
  }

  

  if (loading) {
    return <div>Loading problem data...</div>
  }

  if (!assignment || !problem) {
    return <div>Problem not found.</div>
  }

  return (
    <div className="space-y-6 p-6">
      <BackButton backLink={`/manage-courses/${params.courseId}/grading/${params.assignmentId}`} />
      <h1 className="text-3xl font-bold text-center">
        {/* Assignment: {assignment.title} - Problem {problem.id} */}
        Create Rubric: {assignment.title} Q{questionNumber}
      </h1>
      <GradingProcessSteps
        courseId={params.courseId} // Pass courseId as prop
        assignmentId={params.assignmentId}
        problemId={params.problemId}
        questionNumber={questionNumber}
        referenceSolution={referenceSolution}
        hasRubric={hasRubric}
        isRubricFinalized={isRubricFinalized}
        onReferenceSolutionUpdate={handleReferenceSolutionUpdate}
        onStartRubricCreation={handleStartRubricCreation}
        params={params}
        gradingProgress={0} // Provide a default value or calculate it based on your data
      />
      {isRubricFinalized && (
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/graded`)} disabled={grading}>
            View Student Grades
          </Button>
        </div>
      )}
    </div>
  )
}

