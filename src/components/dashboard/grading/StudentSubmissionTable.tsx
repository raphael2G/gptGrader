'use client'

import { useState } from 'react'
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGetUsersByArrayOfIds } from '@/hooks/queries/useUsers'
import { useGetSubmissionsByAssignmentIdAndProblemId } from '@/hooks/queries/useSubmissions'
import { useGetCourseById } from '@/hooks/queries/useCourses'

interface StudentSubmissionsTableProps {
  courseId: string
  assignmentId: string
  problemId: string
}

export function StudentSubmissionsTable({ 
  courseId, 
  assignmentId, 
  problemId,
}: StudentSubmissionsTableProps) {
  const [showOnlySubmitted, setShowOnlySubmitted] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // First, get the course to get student IDs
  const { 
    data: course,
    isLoading: courseLoading,
    error: courseError
  } = useGetCourseById(courseId)

  // Then fetch all students using those IDs
  const { 
    users: students, 
    isLoading: studentsLoading, 
    error: studentsError 
  } = useGetUsersByArrayOfIds(
    course?.students?.map(id => id.toString()) || [],
    { enabled: !!course }
  )

  // Fetch submissions
  const {
    data: submissions,
    isLoading: submissionsLoading,
    error: submissionsError
  } = useGetSubmissionsByAssignmentIdAndProblemId(assignmentId, problemId)

  if (courseLoading || studentsLoading || submissionsLoading) {
    return <SubmissionsTableSkeleton />
  }

  const error = courseError || studentsError || submissionsError
  if (error) {
    toast({
      title: "Error loading data",
      description: error.message,
      variant: "destructive"
    })
    router.back()
    return null
  }

  if (!course || !students) {
    return null
  }

  // Create a map of student ID to submission for quick lookup
  const submissionMap = new Map(
    submissions?.map(sub => [sub.studentId.toString(), sub]) || []
  )

  // Combine student data with their submissions
  const studentsWithSubmissions = students
    .map(student => ({
      student,
      submission: submissionMap.get(student._id.toString())
    }))
    .filter(({ submission }) => !showOnlySubmitted || submission)

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          checked={showOnlySubmitted}
          onCheckedChange={setShowOnlySubmitted}
        />
        <span>Show only students with submissions</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead>Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studentsWithSubmissions.map(({ student, submission }, index) => (
            <TableRow key={student._id.toString()}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {submission ? (
                  <Link 
                    href={`/manage-courses/${courseId}/grading/${assignmentId}/${problemId}/graded/${submission._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {student.name || 'Unnamed Student'}
                  </Link>
                ) : (
                  student.name || 'Unnamed Student'
                )}
              </TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>
                {submission ? (
                  <span className="text-green-600">Submitted</span>
                ) : (
                  <span className="text-red-600">Not Submitted</span>
                )}
              </TableCell>
              <TableCell>
                {submission 
                  ? new Date(submission.submittedAt).toLocaleString()
                  : '-'
                }
              </TableCell>
              <TableCell>
                {submission?.graded 
                  ? `${submission.appliedRubricItems?.length || 0}`
                  : submission 
                    ? 'Not graded'
                    : '-'
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SubmissionsTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submission Date</TableHead>
          <TableHead>Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, index) => (
          <TableRow key={index}>
            <TableCell>{index + 1}</TableCell>
            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}