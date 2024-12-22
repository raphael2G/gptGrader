'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { IAssignment } from '@@/models/Assignment'
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'

interface AssignmentCardProps {
  courseId: string;
  assignmentId: string;
}

export function AssignmentCard({ courseId, assignmentId }: AssignmentCardProps) {
  const [assignment, setAssignment] = useState<IAssignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true)
      try {
        const response = await assignmentApi.getAssignmentById(assignmentId)
        if (response.data) {
          setAssignment(response.data)
        } else {
          throw new Error(response.error?.error || 'Failed to fetch assignment')
        }
      } catch (err) {
        setError('Failed to load assignment details')
        toast({
          title: "Error",
          description: "Failed to load assignment details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchAssignment()
  }, [assignmentId, toast])

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error || !assignment) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg text-red-500">
            {error || 'Assignment not found'}
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

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

  const statusColors: Record<string, string> = { // Updated status colors
    'Unreleased': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'Open': 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200',
    'Overdue': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200',
    'Closed': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200',
    'Graded': 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200'
  };

  return (
    <Link href={`/courses/${courseId}/assignments/${assignment._id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{assignment.title}</CardTitle>
          <Badge className={statusColors[status]}>
            {status} {/* Display constructed status */}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="mr-1 h-3 w-3" />
            Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

