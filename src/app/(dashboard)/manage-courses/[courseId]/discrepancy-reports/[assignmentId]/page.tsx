'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BackButton } from '@/components/various/BackButton'
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { discrepancyReportApi } from '@/app/lib/client-api/discrepancyReports'
import { IAssignment } from '@@/models/Assignment'
import { IDiscrepancyReport } from '@@/models/DiscrepancyReport'
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, BarChart } from 'lucide-react'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"

export default function AssignmentDiscrepancyReportsPage({ params }: { params: { courseId: string, assignmentId: string } }) {
  const [assignment, setAssignment] = useState<IAssignment | null>(null)
  const [discrepancyReports, setDiscrepancyReports] = useState<IDiscrepancyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchAssignmentAndReports = async () => {
      setLoading(true)
      try {
        const [assignmentResponse, reportsResponse] = await Promise.all([
          assignmentApi.getAssignmentById(params.assignmentId),
          discrepancyReportApi.getDiscrepancyReportsByAssignment(params.assignmentId)
        ])

        console.log('Assignment response:', assignmentResponse);
        console.log('Reports response:', reportsResponse);

        if (!assignmentResponse.data) {
          throw new Error(assignmentResponse.error?.error || 'Failed to fetch assignment')
        }
        setAssignment(assignmentResponse.data)

        if (!reportsResponse.data) {
          throw new Error(reportsResponse.error?.error || 'Failed to fetch discrepancy reports')
        }
        setDiscrepancyReports(reportsResponse.data)

        console.log('Fetched discrepancy reports:', reportsResponse.data);
      } catch (err) {
        console.error('Error fetching assignment and discrepancy reports:', err);
        setError('Failed to fetch assignment and discrepancy reports')
        toast({
          title: "Error",
          description: "Failed to load assignment and discrepancy reports. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAssignmentAndReports()
  }, [params.assignmentId, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">{error || 'Assignment not found'}</p>
        <BackButton />
      </div>
    )
  }

  const pendingReports = discrepancyReports.filter(report => report.status === 'pending')

  return (
    <div className="space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">Discrepancy Reports: {assignment.title}</h1>
      
      <Card className="w-full h-64 mb-6">
        <CardHeader>
          <CardTitle>Discrepancy Reports Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <BarChart className="mx-auto h-16 w-16 mb-4" />
            <p>Total Reports: {discrepancyReports.length}</p>
            <p>Pending Reports: {pendingReports.length}</p>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">Problems with Discrepancy Reports</h2>
      
      {discrepancyReports.length === 0 ? (
        <p className="text-lg text-gray-600 dark:text-gray-400">No discrepancy reports found for this assignment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignment.problems.map((problem, index) => {
            const problemReports = discrepancyReports.filter(report => report.problemId === problem.id)
            const pendingProblemReports = problemReports.filter(report => report.status === 'pending')

            return (
              <Link href={`/manage-courses/${params.courseId}/discrepancy-reports/${params.assignmentId}/${problem.id}`} key={problem.id}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">Problem {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2" title={problem.question}>
                      {problem.question}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">
                        Total Reports: <span className="text-blue-600 dark:text-blue-400">{problemReports.length}</span>
                      </p>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                        {pendingProblemReports.length} pending
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

