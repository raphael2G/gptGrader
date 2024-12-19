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
import { CalendarIcon, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"
import { courseApi } from '@/api-client/endpoints/courses'
import { assignmentApi } from '@/api-client/endpoints/assignments'
import { ICourse } from '@/models/Course'
import { IAssignment } from '@/models/Assignment'

type AssignmentStatus = 'unreleased' | 'released' | 'closed' | 'graded'

function StatusBadge({ status }: { status: AssignmentStatus }) {
  const statusStyles = {
    unreleased: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    released: "bg-green-100 text-green-800 hover:bg-green-200",
    closed: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    graded: "bg-blue-100 text-blue-800 hover:bg-blue-200"
  }

  const displayStatus = status || 'unreleased'

  return (
    <Badge className={`cursor-pointer ${statusStyles[status]}`}>
      {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
    </Badge>
  )
}

function AssignmentCard({ courseId, assignment, onStatusChange }: { 
  courseId: string, 
  assignment: IAssignment;
  onStatusChange: (newStatus: AssignmentStatus) => void 
}) {
  const nextStatus: Record<AssignmentStatus, AssignmentStatus> = {
    unreleased: 'released',
    released: 'closed',
    closed: 'graded',
    graded: 'unreleased'
  }


  return (
    <Card className="h-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <CardHeader>
        <CardTitle className="text-lg">{assignment.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div  className="flex items-center text-sm text-muted-foreground mb-2">
          <CalendarIcon onClick={() => console.log("due date:", assignment.dueDate)} className="mr-2 h-4 w-4" />
          Due: {new Date(assignment.dueDate).toLocaleDateString()}
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Late Deadline: {new Date(assignment.lateDueDate).toLocaleDateString()}
        </div>
        {/* <p className="text-sm mb-2">Problems: {assignment.problems.length}</p> */}
        <div onClick={() => onStatusChange(nextStatus[assignment.status])}>
          <StatusBadge status={assignment.status} />
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/manage-courses/${courseId}/assignments/${assignment._id}/edit`} passHref>
          <Button variant="outline" size="sm" className="w-full">
            Edit Assignment
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function AssignmentsManagementPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<ICourse | null>(null)
  const [loadedAssignments, setLoadedAssignments] = useState<IAssignment[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    lateDueDate: '',
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchCourseAndAssignments = async () => {
      try {
        const { data: foundCourse } = await courseApi.getCourseById(params.courseId);
        if (!foundCourse) return;
        
        setCourse(foundCourse);
        
        // Fetch all assignments in parallel
        const assignmentPromises = foundCourse.assignments.map(id => 
          assignmentApi.getAssignmentById(id.toString())
        );
        
        const assignmentResults = await Promise.all(assignmentPromises);
        const gotAssignments = assignmentResults
          .filter(result => result.data !== null)
          .map(result => result.data!) as IAssignment[];
          
        setLoadedAssignments(gotAssignments);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseAndAssignments();
  }, [params.courseId]);

  const validateAndAddAssignment = async () => {
    if (!course || !newAssignment.title || !newAssignment.description || !newAssignment.dueDate || !newAssignment.lateDueDate) {
      setValidationError("All fields are required")
      return
    }



    const dueDate = new Date(newAssignment.dueDate)
    const lateDeadline = new Date(newAssignment.lateDueDate)
    

    if (lateDeadline <= dueDate) {
      setValidationError("Late submission deadline must be after the due date.")
      toast({
        title: "Validation Error",
        description: "Late submission deadline must be after the due date.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data: newlyCreatedAssignment, error } = await assignmentApi.create(params.courseId, {
        title: newAssignment.title,
        description: newAssignment.description,
        dueDate: dueDate,
        lateDueDate: lateDeadline,
        status: 'unreleased',
        totalPoints: 0,
        problems: []
      })

      if (error) {
        throw new Error(error.error)
      }

      if (!newlyCreatedAssignment){
        throw new Error ("Something went wrong creating the assignment. Please try again")
      }

      setLoadedAssignments(prev => [...prev, newlyCreatedAssignment])

      setNewAssignment({
        title: '',
        description: '',
        dueDate: '',
        lateDueDate: '',
      })
      setValidationError(null)
      setIsAddDialogOpen(false)


      toast({
        title: "Success",
        description: "New assignment added successfully.",
        variant: "success"
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create assignment",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (assignmentId: string, newStatus: AssignmentStatus) => {
    try {
      const { data, error } = await assignmentApi.update(assignmentId, { status: newStatus })
      
      if (error) {
        throw new Error(error.error)
      }

      // Refresh course data
      const { data: updatedCourse } = await courseApi.getCourseById(params.courseId)
      if (updatedCourse) {
        setCourse(updatedCourse)
      }

      toast({
        title: "Success",
        description: "Assignment status updated successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update assignment status",
        variant: "destructive",
      })
    }
  }

  if (isLoading || !course) return <div>Loading...</div>;


  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{course.title}</h1>
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
                <Label htmlFor="assignment-description">Description</Label>
                <Input
                  id="assignment-description"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Assignment description"
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
                <Label htmlFor="late-due-date">Late Submission Deadline</Label>
                <Input
                  id="late-due-date"
                  type="date"
                  value={newAssignment.lateDueDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, lateDueDate: e.target.value })}
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
      
      {loadedAssignments && loadedAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadedAssignments.map((assignment) => (
            <AssignmentCard 
              key={assignment._id?.toString()} 
              courseId={params.courseId}
              assignment={assignment} 
              onStatusChange={(newStatus) => handleStatusChange(assignment._id!.toString(), newStatus)}
            />
          ))}
        </div> 
      ) : ( 
        <p className="text-center text-gray-500 dark:text-gray-400">
          You do not have any assignments yet. Click the "Add New Assignment" button to get started!
        </p>
      )}
    </div>
  )
}