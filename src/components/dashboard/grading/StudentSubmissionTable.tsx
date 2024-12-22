'use client'

import { useState, useEffect } from 'react'
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ISubmission } from '@@/models/Submission'
import { IUser } from '@@/models/User'
import { submissionApi } from '@/app/lib/client-api/submissions'
import { userApi } from '@/app/lib/client-api/users'
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import Link from 'next/link'

interface StudentSubmissionsTableProps {
  assignmentId: string
  problemId: string
  courseId: string
}

interface EnhancedSubmission extends ISubmission {
  student: IUser
}

type SortField = 'name' | 'email' | 'submittedAt' | 'score'
type SortOrder = 'asc' | 'desc'

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

export function StudentSubmissionsTable({ assignmentId, problemId, courseId }: StudentSubmissionsTableProps) {
  const [submissions, setSubmissions] = useState<EnhancedSubmission[]>([])
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSubmissionsAndUserData = async () => {
      setLoading(true)
      try {
        const response = await submissionApi.getSubmissionsByAssignmentId(assignmentId)
        if (response.data) {
          const filteredSubmissions = response.data.filter(s => s.problemId === problemId)
          
          const enhancedSubmissions = await Promise.all(
            filteredSubmissions.map(async (submission) => {
              const userResponse = await userApi.getUserById(submission.studentId)
              return {
                ...submission,
                student: userResponse.data as IUser
              }
            })
          )
          
          setSubmissions(enhancedSubmissions)
        } else {
          throw new Error(response.error?.error || 'Failed to fetch submissions')
        }
      } catch (err) {
        setError('Failed to fetch submissions')
        toast({
          title: "Error",
          description: "Failed to fetch submissions. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissionsAndUserData()
  }, [assignmentId, problemId, toast])

  const sortSubmissions = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }

    const sortedSubmissions = [...submissions].sort((a, b) => {
      let comparison = 0
      switch (field) {
        case 'name':
          comparison = a.student.name.localeCompare(b.student.name)
          break
        case 'email':
          comparison = a.student.email.localeCompare(b.student.email)
          break
        case 'submittedAt':
          comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
          break
        case 'score':
          const scoreA = a.graded ? calculateScore(a) : -1
          const scoreB = b.graded ? calculateScore(b) : -1
          comparison = scoreA - scoreB
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setSubmissions(sortedSubmissions)
  }

  const SortableHeader = ({ field, label }: { field: SortField, label: string }) => (
    <TableHead>
      <Button 
        variant="ghost" 
        onClick={() => sortSubmissions(field)} 
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

  if (loading) {
    return <SubmissionsTableSkeleton />
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">#</TableHead>
          <SortableHeader field="name" label="Name" />
          <SortableHeader field="email" label="Email" />
          <SortableHeader field="submittedAt" label="Submission Date" />
          <SortableHeader field="score" label="Score" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission, index) => (
          <TableRow key={submission._id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <Link 
                href={`/manage-courses/${courseId}/grading/${assignmentId}/${problemId}/graded/${submission._id}`}
                className="text-blue-600 hover:underline"
              >
                {submission.student.name}
              </Link>
            </TableCell>
            <TableCell>{submission.student.email}</TableCell>
            <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
            <TableCell>
              {submission.graded 
                ? calculateScore(submission)
                : 'Not graded'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function calculateScore(submission: ISubmission): number {
  // This is a placeholder function. You'll need to implement the actual score calculation
  // based on your rubric and grading system.
  const earnedPoints = submission.appliedRubricItemIds.length // This is just an example
  return earnedPoints
}

function SubmissionsTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
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
            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

