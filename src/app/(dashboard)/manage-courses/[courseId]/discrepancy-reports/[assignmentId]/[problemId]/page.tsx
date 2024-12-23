'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/various/BackButton'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { IAssignment, IProblem } from '@@/models/Assignment'
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle } from 'lucide-react'
import { RubricWithDiscrepancyIndicator } from '@/components/rubrics/RubricWithDiscrepancyIndicator'
import { QuestionAndReferenceSolution } from '@/components/various/QuestionAndReferenceSolution'
import { DiscrepancyReportsTable } from '@/components/dashboard/discrepancyReport/DiscrepancyReportTable'

export default function ProblemDiscrepancyReportPage({ params }: { params: { courseId: string, assignmentId: string, problemId: string } }) {
  const [assignment, setAssignment] = useState<IAssignment | null>(null)
  const [problem, setProblem] = useState<IProblem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const assignmentResponse = await assignmentApi.getAssignmentById(params.assignmentId)

        if (!assignmentResponse.data) {
          throw new Error('Failed to fetch assignment')
        }
        setAssignment(assignmentResponse.data)

        const foundProblem = assignmentResponse.data.problems.find(p => p.id === params.problemId)
        if (!foundProblem) {
          throw new Error('Problem not found')
        }
        setProblem(foundProblem)

      } catch (err) {
        setError('Failed to fetch data')
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.assignmentId, params.problemId, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !assignment || !problem) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">{error || 'Data not found'}</p>
        <BackButton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">Discrepancy Reports: {assignment.title}</h1>
      <h2 className="text-2xl font-semibold">Problem {problem.question}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuestionAndReferenceSolution problem={problem} />
        <RubricWithDiscrepancyIndicator assignmentId={params.assignmentId} problem={problem} />
      </div>

      <DiscrepancyReportsTable 
        courseId={params.courseId}
        assignmentId={params.assignmentId}
        problemId={params.problemId}
      />
    </div>
  )
}

