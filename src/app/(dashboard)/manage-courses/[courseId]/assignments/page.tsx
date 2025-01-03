'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BackButton } from '@/components/various/BackButton'
import { IAssignment } from '@/models/Assignment'
import { Plus, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge" // Import Badge

import { useGetCourseById } from '@/hooks/queries/useCourses'
import { 
  useGetAssignmentsByArrayOfIds, 
  useCreateAssignment
 } from '@/hooks/queries/useAssignments'

function AssignmentCard({ assignment }: { assignment: IAssignment }) {
  console.log("assignment: ", assignment)
  return (
    <Link href={`/manage-courses/${assignment.courseId.toString()}/assignments/${assignment._id.toString()}`}>
      <Card className="h-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <CardHeader>
          <div className="flex justify-between items-start w-full"> {/* Added flex and w-full */}
            <CardTitle className="text-lg">{assignment.title}</CardTitle>
            <div> {/* Added container for badges */}
              <Badge className={assignment.isPublished ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200'}>
                {assignment.isPublished ? 'Published' : 'Draft'}
              </Badge>
              <Badge className={assignment.areGradesReleased ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}>
                {assignment.areGradesReleased ? 'Grades Released' : 'Grades Not Released'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </div>
          <p className="text-sm mt-2">Problems: {assignment.problems.length}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function AssignmentsPage({ params }: { params: { courseId: string } }) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newAssignment, setNewAssignment] = useState<Partial<IAssignment>>({
    title: '',
    description: '',
    dueDate: new Date(),
    lateDueDate: new Date(),
    problems: []
  })
  const router = useRouter()
  const { toast } = useToast()

  const {
    data: course, 
    isLoading: isGettingCourse, 
    error: errorGettingCourse
  } = useGetCourseById(params.courseId);

  const {
    assignments, 
    isLoading: isGettingAssignments, 
    error: errorGettingAssignments
  } = useGetAssignmentsByArrayOfIds(course?.assignments.map(id => id.toString()) || [], {enabled: !!course && !isGettingCourse})

  const { mutate: createAssignment, isPending: isCreatingAssignment } = useCreateAssignment();

  if (isGettingCourse) return <div>Fetching course data...</div>
  if (isGettingAssignments) return <div>Fetching assignments data...</div>
  if (errorGettingCourse) {
    // router.push("/manage-courses")
    return <div>There was an issue getting your course. {errorGettingCourse?.message}</div>;
  }
  if (errorGettingAssignments) {
    // router.push("/manage-courses")
    return <div>There was an issue getting your assignments for this course. {errorGettingAssignments?.message}</div>;
  }


const handleAddAssignment = () => {
  if (!newAssignment.lateDueDate || !newAssignment.dueDate || newAssignment.lateDueDate < newAssignment.dueDate) {
    toast({
      title: "Validation Error",
      description: "Late due date cannot be before the due date.",
      variant: "destructive",
    })
    return false
  }
  createAssignment(
    {
      courseId: params.courseId,
      assignmentData: newAssignment as IAssignment
    },
    {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        setNewAssignment({
          title: '',
          description: '',
          dueDate: new Date(),
          lateDueDate: new Date(),
          problems: []
        });
        toast({
          title: "Success",
          description: "Assignment added successfully.",
          variant: "success"
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to add assignment. Please try again.",
          variant: "destructive",
        });
      }
    }
  );
};


  return (
    <div className="space-y-6">
      <BackButton backLink={`/manage-courses/${params.courseId}`}/>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Assignments</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Assignment</DialogTitle>
              <DialogDescription>Enter the details for the new assignment.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="assignment-title">Title</Label>
                <Input
                  id="assignment-title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment-description">Description</Label>
                <Input
                  id="assignment-description"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment-due-date">Due Date</Label>
                <Input
                  id="assignment-due-date"
                  type="date"
                  value={newAssignment.dueDate?.toISOString().split('T')[0]}
                  onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: new Date(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment-final-deadline">Final Submission Deadline</Label>
                <Input
                  id="assignment-final-deadline"
                  type="date"
                  value={newAssignment.lateDueDate?.toISOString().split('T')[0]}
                  onChange={(e) => setNewAssignment({ ...newAssignment, lateDueDate: new Date(e.target.value) })}
                />
              </div>
            </div>
            <Button onClick={handleAddAssignment}>Add Assignment</Button>
          </DialogContent>
        </Dialog>
      </div>

      {assignments?.length === 0 ? (
        <p>No assignments found for this course.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment) => (
            <AssignmentCard key={assignment._id.toString()} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  )
}

