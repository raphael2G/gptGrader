'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BackButton } from '@/components/various/BackButton'
import { Badge } from "@/components/ui/badge"
import { useGetCourseById } from '@/hooks/queries/useCourses'
import { useGetAssignmentsByArrayOfIds } from '@/hooks/queries/useAssignments'
import { IAssignment } from '@/models/Assignment'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function GradingPage({ params }: { params: { courseId: string } }) {
  // Hooks
  const router = useRouter()
  const { toast } = useToast()

  // Queries
  const { 
    data: course, 
    isLoading: courseLoading,
    error: courseError
  } = useGetCourseById(params.courseId)

  const {
    assignments = [],
    isLoading: assignmentsLoading,
    error: assignmentsError
  } = useGetAssignmentsByArrayOfIds(
    course?.assignments?.map(id => id.toString()) || [],
    { enabled: !!course }
  )

  // Loading states
  const isLoading = courseLoading || assignmentsLoading

  // Error handling
  if (courseError || assignmentsError) {
    toast({
      title: "Error loading data",
      description: (courseError || assignmentsError)?.message || "Please try again later",
      variant: "destructive"
    })
    router.push('/manage-courses')
    return null
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!course) {
    return <div>Course not found.</div>
  }

  const getGradingStatusBadge = (assignment: IAssignment) => {
    // Construct status string based on flags and due/late dates
    let status = '';
    if (!assignment.isPublished) {
      status = 'Unreleased';
    } else if (new Date() < assignment.dueDate) {
      status = 'Open';
    } else if (new Date() < assignment.lateDueDate) {
      status = 'Overdue';
    } else if (!assignment.areGradesReleased) {
      status = 'Closed';
    } else {
      status = 'Graded';
    }

    const statusColors: Record<string, string> = {
      'Unreleased': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      'Open': 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200',
      'Overdue': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200',
      'Closed': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200',
      'Graded': 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200'
    };
  
    return (
      <Badge className={statusColors[status]}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <BackButton backLink={`/manage-courses/${params.courseId}`}/>
      <h1 className="text-3xl font-bold">Grading: {course.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p>No assignments found for this course.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Late Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment._id.toString()}>
                    <TableCell>{assignment.title}</TableCell>
                    <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(assignment.lateDueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getGradingStatusBadge(assignment)}</TableCell>
                    <TableCell>
                      <Link 
                        href={`/manage-courses/${params.courseId}/grading/${assignment._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Review Submissions
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}