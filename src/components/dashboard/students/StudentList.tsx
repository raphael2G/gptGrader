import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from 'next/link'
import { Loader2 } from "lucide-react"
import { useGetCourseById } from '@/hooks/queries/useCourses'
import { useGetAssignmentsByArrayOfIds } from '@/hooks/queries/useAssignments'
import { useGetUserById } from '@/hooks/queries/useUsers'
import { useGetSubmissionsByStudentId } from '@/hooks/queries/useSubmissions'
import React from 'react'

type SortField = 'name' | 'email' | 'updatedAt' | 'completionRate' | 'pointsEarnedRate'
type SortOrder = 'asc' | 'desc'

interface ProcessedStudentData {
  _id: string
  name: string
  email: string
  completionRate: number
  pointsEarnedRate: number
  updatedAt: Date
}

const LongArrowUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 20V4" />
    <path d="M5 11l7-7 7 7" />
  </svg>
)

const LongArrowDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 4v16" />
    <path d="M19 13l-7 7-7-7" />
  </svg>
)

export function StudentList({ courseId }: { courseId: string }) {
  // Local state for sorting
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // Fetch course data
  const { data: course, isLoading: isCourseLoading, error: courseError } = useGetCourseById(courseId)

  // Fetch assignments for this course
  const { assignments, isLoading: isAssignmentsLoading, error: assignmentsError } = 
    useGetAssignmentsByArrayOfIds(course?.assignments?.map(id => id.toString()) || [])

  // Fetch user data and submissions for each student
  const studentQueries = course?.students?.map(studentId => ({
    user: useGetUserById(studentId.toString()),
    submissions: useGetSubmissionsByStudentId(studentId.toString())
  })) || []

  const isStudentDataLoading = studentQueries.some(query => query.user.isLoading || query.submissions.isLoading)
  const studentDataError = studentQueries.find(query => query.user.error || query.submissions.error)?.user.error

  // Calculate total problems and points across all assignments
  const totalProblems = assignments?.reduce((acc, assignment) => 
    acc + assignment.problems.length, 0) || 0

  const totalPoints = assignments?.reduce((acc, assignment) => 
    acc + assignment.problems.reduce((sum, problem) => sum + problem.maxPoints, 0), 0) || 0

  // Process student data
  const processedStudentData: ProcessedStudentData[] = React.useMemo(() => {
    if (!course?.students || !assignments || studentQueries.some(q => !q.user.data || !q.submissions.data)) return []

    const courseAssignmentIds = new Set(course.assignments.map(id => id.toString()))

    return course.students.map(studentId => {
      const studentQuery = studentQueries.find(q => 
        q.user.data?._id.toString() === studentId.toString()
      )
      
      if (!studentQuery) return null

      const { user: { data: userData }, submissions: { data: allSubmissions } } = studentQuery

      // Filter submissions to only include those from this course's assignments
      const courseSubmissions = allSubmissions?.filter(submission => 
        courseAssignmentIds.has(submission.assignmentId.toString())
      ) || []

      // Calculate completion rate
      const totalSubmitted = new Set(courseSubmissions.map(sub => sub.problemId.toString())).size
      const completionRate = (totalSubmitted / totalProblems) * 100

      // Calculate points earned rate
      const pointsEarned = courseSubmissions.reduce((acc, submission) => {
        const problem = assignments
          .flatMap(a => a.problems)
          .find(p => p._id?.toString() === submission.problemId.toString())

        if (!problem || !submission.appliedRubricItems) return acc

        const earnedForSubmission = submission.appliedRubricItems.reduce((sum, itemId) => {
          const rubricItem = problem.rubric.items.find(item => 
            item._id?.toString() === itemId.toString()
          )
          return sum + (rubricItem?.points || 0)
        }, 0)

        return acc + earnedForSubmission
      }, 0)

      const pointsEarnedRate = (pointsEarned / totalPoints) * 100

      // Get the latest submission date
      const latestSubmission = courseSubmissions.reduce((latest, current) => {
        return latest.submittedAt > current.submittedAt ? latest : current
      }, courseSubmissions[0])

      return {
        _id: studentId.toString(),
        name: userData?.name || 'Unknown Student',
        email: userData?.email || 'No email',
        completionRate,
        pointsEarnedRate,
        updatedAt: latestSubmission?.submittedAt || new Date()
      }
    }).filter((student): student is ProcessedStudentData => student !== null)
  }, [course?.students, course?.assignments, assignments, studentQueries])

  // Sorting function
  const sortStudents = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Sort the processed data
  const sortedStudents = [...processedStudentData].sort((a, b) => {
    let comparison = 0
    if (sortField === 'name' || sortField === 'email') {
      comparison = a[sortField].localeCompare(b[sortField])
    } else if (sortField === 'updatedAt') {
      comparison = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()
    } else {
      comparison = (a[sortField] ?? -1) - (b[sortField] ?? -1)
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  // Loading state
  if (isCourseLoading || isAssignmentsLoading || isStudentDataLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Error state
  if (courseError || assignmentsError || studentDataError) {
    return (
      <div className="text-red-500 p-4">
        Error loading student data: {(courseError || assignmentsError || studentDataError)?.message}
      </div>
    )
  }

  const SortableHeader = ({ field, label, className }: { field: SortField, label: string, className?: string }) => (
    <TableHead className={className}>
      <Button 
        variant="ghost" 
        onClick={() => sortStudents(field)} 
        className={cn(
          "w-full justify-between font-medium",
          sortField === field ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
        <span className="ml-2 flex">
          {sortField === field ? (
            sortOrder === 'asc' ? (
              <LongArrowUp className="h-5 w-5 text-primary" />
            ) : (
              <LongArrowDown className="h-5 w-5 text-primary" />
            )
          ) : (
            <span className="h-5 w-5" /> 
          )}
        </span>
      </Button>
    </TableHead>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrolled Students</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="name" label="Name" />
              <SortableHeader field="email" label="Email" />
              <SortableHeader field="completionRate" label="Submissions" className="text-center" />
              <SortableHeader field="pointsEarnedRate" label="Points Earned" className="text-center" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStudents.map((student) => (
              <TableRow key={student._id}>
                <TableCell>
                  <Link href={`/manage-courses/${courseId}/students/${student._id}`} className="text-blue-600 hover:underline">
                    {student.name}
                  </Link>
                </TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell className="text-center">
                  {student.completionRate.toFixed(1)}%
                </TableCell>
                <TableCell className="text-center">
                  {student.pointsEarnedRate.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}