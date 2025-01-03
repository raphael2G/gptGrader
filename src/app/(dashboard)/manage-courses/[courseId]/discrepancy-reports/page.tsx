'use client'

import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/various/BackButton'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, BarChart } from 'lucide-react'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { useGetCourseById } from '@/hooks/queries/useCourses'
import { useGetAssignmentsByArrayOfIds } from '@/hooks/queries/useAssignments'
import { useGetDiscrepancyReportsByArrayOfAssignmentIds } from '@/hooks/queries/useDiscrepancyReports'
import { IDiscrepancyReport } from '@/models/DiscrepancyReport'

export default function DiscrepancyReportsPage({ params }: { params: { courseId: string } }) {
  const router = useRouter()
  const { toast } = useToast()

  // 1. First get the course to get assignment IDs
  const { 
    data: course, 
    isLoading: courseLoading, 
    error: courseError 
  } = useGetCourseById(params.courseId);

  // 2. Then get the assignments using the IDs from the course
  const {
    assignments = [],
    isLoading: assignmentsLoading,
    error: assignmentsError
  } = useGetAssignmentsByArrayOfIds(
    course?.assignments?.map(id => id.toString()) || [], 
    { enabled: !!course?.assignments?.length }
  );

  // 3. Finally get all discrepancy reports for these assignments
  const {
    reports = {},
    isLoading: reportsLoading,
    error: reportsError,
  } = useGetDiscrepancyReportsByArrayOfAssignmentIds(
    assignments?.map(a => a._id.toString()) || [],
    { enabled: !!assignments && assignments.length > 0 }
  );

  // Combine loading states
  const isLoading = courseLoading || assignmentsLoading || reportsLoading;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Handle errors
  if (courseError || assignmentsError || reportsError) {
    const errorMessage = 
      (courseError?.message || "no course error ") + 
      (assignmentsError?.message || "no assignment error ") +  
      (reportsError?.message || "no reports error ");
    
    return <div>error message: {errorMessage} </div>;
  }

  if (!course) {
    return <div>no course</div>
  }


  return (
    <div className="space-y-6">
      <BackButton backLink={`/manage-courses/${params.courseId}`}/>
      <h1 className="text-3xl font-bold">Discrepancy Reports</h1>

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
          {assignments.map((assignment) => {
            const assignmentId = assignment._id.toString();
            const pendingCount = reports[assignmentId]?.filter((r: IDiscrepancyReport) => r.status == "pending").length;
            return (
              <Link 
                href={`/manage-courses/${params.courseId}/discrepancy-reports/${assignmentId}`} 
                key={assignmentId}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                      >
                        {pendingCount} pending
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  )
}