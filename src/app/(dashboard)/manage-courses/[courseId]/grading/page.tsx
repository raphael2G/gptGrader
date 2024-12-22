'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BackButton } from '@/components/various/BackButton'
import { courseApi } from '@/app/lib/client-api/courses'
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { ICourse } from '@@/models/Course'
import { IAssignment } from '@@/models/Assignment'
import { useToast } from "@/components/ui/use-toast"
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"

interface AssignmentWithUniqueSubmissions extends IAssignment {
  uniqueSubmissions: number
}

export default function GradingPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<ICourse | null>(null)
  const [assignments, setAssignments] = useState<AssignmentWithUniqueSubmissions[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [courseResponse, assignmentsResponse] = await Promise.all([
          courseApi.getCourseById(params.courseId),
          assignmentApi.getAllAssignmentsWithSubmissionInfo(params.courseId)
        ])

        if (courseResponse.data && assignmentsResponse.data) {
          setCourse(courseResponse.data)
          setAssignments(assignmentsResponse.data) // Removed filter, handle status in badge
        } else {
          throw new Error('Failed to fetch course or assignments data')
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          variant: "destructive",
        })
        router.push('/manage-courses')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.courseId, router, toast])

  if (loading) {
    return <div>Loading grading data...</div>
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
    } else if (new Date() < assignment.finalSubmissionDeadline) {
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
      <BackButton />
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
                  <TableHead>Final Submission Deadline</TableHead>
                  <TableHead>Unique Submissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment._id}>
                    <TableCell>{assignment.title}</TableCell>
                    <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(assignment.finalSubmissionDeadline).toLocaleDateString()}</TableCell>
                    <TableCell>{assignment.uniqueSubmissions}</TableCell>
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

