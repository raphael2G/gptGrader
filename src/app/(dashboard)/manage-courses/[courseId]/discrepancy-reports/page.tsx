'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/various/BackButton'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { discrepancyReportApi } from '@/app/lib/client-api/discrepancyReports'
import { IAssignment } from '@@/models/Assignment'
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, BarChart } from 'lucide-react'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"

interface AssignmentWithReports extends IAssignment {
  pendingReports: number;
}

export default function DiscrepancyReportsPage({ params }: { params: { courseId: string } }) {
  const [assignments, setAssignments] = useState<AssignmentWithReports[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchAssignmentsAndReports = async () => {
      setLoading(true)
      try {
        const assignmentsResponse = await assignmentApi.getAssignmentsByCourseId(params.courseId)
        if (!assignmentsResponse.data) {
          throw new Error(assignmentsResponse.error?.error || 'Failed to fetch assignments')
        }

        const assignmentsWithReports = await Promise.all(
          assignmentsResponse.data.map(async (assignment) => {
            const reportsResponse = await discrepancyReportApi.getDiscrepancyReportsByAssignment(assignment._id)
            const pendingReports = reportsResponse.data?.filter(report => report.status === 'pending').length || 0
            return { ...assignment, pendingReports }
          })
        )

        setAssignments(assignmentsWithReports)
      } catch (err) {
        setError('Failed to fetch assignments and discrepancy reports')
        toast({
          title: "Error",
          description: "Failed to load assignments and discrepancy reports. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAssignmentsAndReports()
  }, [params.courseId, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">{error}</p>
        <BackButton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">Discrepancy Reports</h1>

      {/* Chart placeholder */}
      <Card className="w-full h-64">
        <CardHeader>
          <CardTitle>Discrepancy Reports Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <BarChart className="mx-auto h-16 w-16 mb-4" />
            <p>Chart placeholder - Discrepancy reports data visualization will be added here</p>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Assignments with Discrepancy Reports</h2>

      {assignments.length === 0 ? (
        <p className="text-lg text-gray-600 dark:text-gray-400">No assignments found for this course.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment) => (
            <Link href={`/manage-courses/${params.courseId}/discrepancy-reports/${assignment._id}`} key={assignment._id}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      {assignment.pendingReports} pending
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

