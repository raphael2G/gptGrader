'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BackButton } from '@/components/dashboard/BackButton'
import { getInstructorCourses, addAssignmentToCourse, updateAssignmentStatus, InstructorCourse, InstructorAssignment, AssignmentStatus } from '@/lib/dummy/instructorCourses'
import { CalendarIcon, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"

function StatusBadge({ status }: { status: AssignmentStatus }) {
  const statusStyles = {
    unreleased: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    released: "bg-green-100 text-green-800 hover:bg-green-200",
    closed: "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }

  return (
    <Badge className={`cursor-pointer ${statusStyles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function AssignmentCard({ courseId, assignment, onStatusChange }: { courseId: string, assignment: InstructorAssignment; onStatusChange: (newStatus: AssignmentStatus) => void }) {
  const nextStatus: Record<AssignmentStatus, AssignmentStatus> = {
    unreleased: 'released',
    released: 'closed',
    closed: 'unreleased'
  }

  return (
    <Card className="h-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <CardHeader>
        <CardTitle className="text-lg">{assignment.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Due: {assignment.dueDate}
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Late Deadline: {assignment.finalSubmissionDeadline}
        </div>
        <p className="text-sm mb-2">Problems: {assignment.problems.length}</p>
        <div onClick={() => onStatusChange(nextStatus[assignment.status])}>
          <StatusBadge status={assignment.status} />
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/manage-courses/${courseId}/assignments/${assignment.id}/edit`} passHref>
          <Button variant="outline" size="sm" className="w-full">
            Edit Assignment
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function AssignmentsManagementPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<InstructorCourse | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newAssignment, setNewAssignment] = useState<Partial<InstructorAssignment>>({
    title: '',
    dueDate: '',
    finalSubmissionDeadline: '',
    problems: []
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const foundCourse = getInstructorCourses().find((c: any) => c.id === params.courseId)
    if (foundCourse) {
      setCourse(foundCourse)
    } else {
      router.push('/manage-courses')
    }
  }, [params.courseId, router])

  const validateAndAddAssignment = () => {
    if (course && newAssignment.title && newAssignment.dueDate && newAssignment.finalSubmissionDeadline) {
      const dueDate = new Date(newAssignment.dueDate)
      const lateDeadline = new Date(newAssignment.finalSubmissionDeadline)

      if (lateDeadline <= dueDate) {
        setValidationError("Late submission deadline must be after the due date.")
        toast({
          title: "Validation Error",
          description: "Late submission deadline must be after the due date.",
          variant: "destructive",
        })
        return
      }

      const assignmentToAdd: InstructorAssignment = {
        // id: `${course.id}-hw${course.assignments.length + 1}`,
        ...newAssignment as InstructorAssignment,
        status: 'unreleased',
        problems: []
      }

      addAssignmentToCourse(course.id, assignmentToAdd)
      const updatedCourse = getInstructorCourses().find((c: any) => c.id === course.id)
      if (updatedCourse) {
        setCourse(updatedCourse)
      }
      setNewAssignment({
        title: '',
        dueDate: '',
        finalSubmissionDeadline: '',
        problems: []
      })
      setValidationError(null)
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: "New assignment added successfully.",
      })
    }
  }

  const handleStatusChange = (assignmentId: string, newStatus: AssignmentStatus) => {
    if (course) {
      updateAssignmentStatus(course.id, assignmentId, newStatus)
      setCourse((prevCourse: any) => {
        if (prevCourse) {
          return {
            ...prevCourse,
            assignments: prevCourse.assignments.map((assignment: any) =>
              assignment.id === assignmentId ? { ...assignment, status: newStatus } : assignment
            )
          }
        }
        return prevCourse
      })
    }
  }

  if (!course) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Assignments: {course.title}</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Assignment</DialogTitle>
              <DialogDescription>Enter the details for the new assignment.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="assignment-title">Assignment Title</Label>
                <Input
                  id="assignment-title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="e.g., Introduction to Python"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="final-submission-deadline">Late Submission Deadline</Label>
                <Input
                  id="final-submission-deadline"
                  type="date"
                  value={newAssignment.finalSubmissionDeadline}
                  onChange={(e) => setNewAssignment({ ...newAssignment, finalSubmissionDeadline: e.target.value })}
                />
              </div>
              {validationError && (
                <p className="text-sm text-red-500">{validationError}</p>
              )}
            </div>
            <Button onClick={validateAndAddAssignment}>Add Assignment</Button>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {course.assignments.map((assignment: any) => (
          <AssignmentCard 
            key={assignment.id} 
            courseId={params.courseId}
            assignment={assignment} 
            onStatusChange={(newStatus) => handleStatusChange(assignment.id, newStatus)}
          />
        ))}
      </div>
    </div>
  )
}

