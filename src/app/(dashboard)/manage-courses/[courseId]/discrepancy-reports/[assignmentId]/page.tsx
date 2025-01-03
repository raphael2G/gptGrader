'use client'

import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BackButton } from '@/components/various/BackButton'
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, BarChart } from 'lucide-react'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { useGetAssignmentById } from '@/hooks/queries/useAssignments'
import { useGetDiscrepancyReportsByAssignmentId } from '@/hooks/queries/useDiscrepancyReports'

export default function AssignmentDiscrepancyReportsPage({ 
  params 
}: { 
  params: { 
    courseId: string; 
    assignmentId: string; 
  } 
}) {
  // Validate required params
  if (!params?.courseId || !params?.assignmentId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-500 mb-4">Missing Parameters</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Required parameters are missing.
        </p>
        <BackButton />
      </div>
    )
  }

  // Standard hooks
  const router = useRouter()
  const { toast } = useToast()

  // Data fetching with React Query
  const { 
    data: assignment,
    isLoading: assignmentLoading,
    error: assignmentError
  } = useGetAssignmentById(params.assignmentId)

  const {
    data: discrepancyReports = [], // Provide empty array as default value
    isLoading: reportsLoading,
    error: reportsError
  } = useGetDiscrepancyReportsByAssignmentId(params.assignmentId)

  // Combined loading state
  const isLoading = assignmentLoading || reportsLoading

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Handle errors or missing data
  if (assignmentError || reportsError || !assignment || !assignment.problems) {
    const error = assignmentError || reportsError
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {error?.message || 'Failed to load data'}
        </p>
        <BackButton />
      </div>
    )
  }

  // Safe array of pending reports with null checks
  const pendingReports = discrepancyReports?.filter(report => report && report.status === 'pending') || []

  return (
    <div className="space-y-6">
      <BackButton backLink={`/manage-courses/${params.courseId}/discrepancy-reports`}/>
      <h1 className="text-3xl font-bold">
        Discrepancy Reports: {assignment?.title || 'Untitled Assignment'}
      </h1>
      
      <Card className="w-full h-64 mb-6">
        <CardHeader>
          <CardTitle>Discrepancy Reports Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <BarChart className="mx-auto h-16 w-16 mb-4" />
            <p>Total Reports: {discrepancyReports?.length ?? 0}</p>
            <p>Pending Reports: {pendingReports?.length ?? 0}</p>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">Problems with Discrepancy Reports</h2>
      
      {!discrepancyReports?.length ? (
        <p className="text-lg text-gray-600 dark:text-gray-400">
          No discrepancy reports found for this assignment.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignment.problems.map((problem, index) => {
            if (!problem || !problem._id) return null;

            const problemReports = discrepancyReports.filter(
              report => report && 
                report.problemId && 
                problem._id && 
                report.problemId.toString() === problem._id.toString()
            )

            const pendingProblemReports = problemReports.filter(
              report => report && report.status === 'pending'
            )

            const problemId = problem._id.toString()

            return (
              <Link 
                href={`/manage-courses/${params.courseId}/discrepancy-reports/${params.assignmentId}/${problemId}`} 
                key={problemId}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Problem {index + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p 
                      className="text-sm text-muted-foreground mb-2 line-clamp-2" 
                      title={problem.question || 'No question provided'}
                    >
                      {problem.question || 'No question provided'}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">
                        Total Reports: {' '}
                        <span className="text-blue-600 dark:text-blue-400">
                          {problemReports?.length ?? 0}
                        </span>
                      </p>
                      <Badge 
                        variant="secondary" 
                        className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                      >
                        {pendingProblemReports?.length ?? 0} pending
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}