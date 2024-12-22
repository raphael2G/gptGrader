'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { courseApi } from '@/app/lib/client-api/courses'
import { submissionApi } from '@/app/lib/client-api/submissions'
import { IUser } from '@@/models/User'
import { cn } from "@/lib/utils"
import Link from 'next/link'

type SortField = 'name' | 'email' | 'updatedAt' | 'completionRate' | 'pointsEarnedRate'
type SortOrder = 'asc' | 'desc'

interface StudentWithStats extends IUser {
  completionRate: number | null
  pointsEarnedRate: number | null
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
  const [students, setStudents] = useState<StudentWithStats[]>([])
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const studentsResponse = await courseApi.getStudentsInCourse(courseId)
        
        if (!studentsResponse.data) {
          throw new Error(studentsResponse.error?.error || 'Failed to fetch students')
        }

        const enrolledStudents = studentsResponse.data

        const studentsWithStats = await Promise.all(enrolledStudents.map(async (student) => {
          const statsResponse = await submissionApi.getStudentCourseStats(courseId, student._id)
          
          return {
            ...student,
            completionRate: statsResponse.data ? statsResponse.data.completionRate : null,
            pointsEarnedRate: statsResponse.data ? statsResponse.data.pointsEarnedRate : null
          }
        }))

        setStudents(studentsWithStats)
        setError(null)
      } catch (err) {
        setError('Failed to fetch student data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId])

  const sortStudents = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }

    const sortedStudents = [...students].sort((a, b) => {
      let comparison = 0
      if (field === 'name' || field === 'email') {
        comparison = a[field].localeCompare(b[field])
      } else if (field === 'updatedAt') {
        comparison = new Date(a[field]).getTime() - new Date(b[field]).getTime()
      } else {
        const aValue = a[field] ?? -1
        const bValue = b[field] ?? -1
        comparison = aValue - bValue
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setStudents(sortedStudents)
  }

  const SortableHeader = ({ field, label }: { field: SortField, label: string }) => (
    <TableHead>
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

  if (loading) {
    return <div>Loading student data...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

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
              <SortableHeader field="updatedAt" label="Last Updated" className="text-center" />
              <SortableHeader field="completionRate" label="Submissions" className="text-center" />
              <SortableHeader field="pointsEarnedRate" label="Points Earned" className="text-center" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student._id}>
                <TableCell>
                  <Link href={`/manage-courses/${courseId}/students/${student._id}`} className="text-blue-600 hover:underline">
                    {student.name}
                  </Link>
                </TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell className="text-center">{new Date(student.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-center">
                  {student.completionRate !== null
                    ? `${(student.completionRate * 100).toFixed(0)}%` 
                    : '-'}
                </TableCell>
                <TableCell className="text-center">
                  {student.pointsEarnedRate !== null
                    ? `${(student.pointsEarnedRate * 100).toFixed(0)}%` 
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

