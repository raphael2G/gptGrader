'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BackButton } from '@/components/various/BackButton'
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { IAssignment } from '@/app/models/Assignment'
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

function AssignmentCard({ assignment }: { assignment: IAssignment }) {
  return (
    <Link href={`/manage-courses/${assignment.courseId}/assignments/${assignment._id}`}>
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
  const [assignments, setAssignments] = useState<IAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newAssignment, setNewAssignment] = useState<Partial<IAssignment>>({
    title: '',
    description: '',
    dueDate: new Date(),
    finalSubmissionDeadline: new Date(),
    problems: []
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    setLoading(true)
    try {
      const response = await assignmentApi.getAssignmentsByCourseId(params.courseId)
      if (response.data) {
        setAssignments(response.data)
      } else {
        throw new Error(response.error?.error || 'Failed to fetch assignments')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddAssignment = async () => {
    try {
      const response = await assignmentApi.createAssignment(params.courseId, newAssignment as IAssignment)
      if (response.data) {
        setAssignments([...assignments, response.data])
        setIsAddDialogOpen(false)
        setNewAssignment({
          title: '',
          description: '',
          dueDate: new Date(),
          finalSubmissionDeadline: new Date(),
          problems: []
        })
        toast({
          title: "Success",
          description: "Assignment added successfully.",
        })
      } else {
        throw new Error(response.error?.error || 'Failed to add assignment')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add assignment. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading assignments...</div>
  }

  return (
    <div className="space-y-6">
      <BackButton />
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
                  value={newAssignment.finalSubmissionDeadline?.toISOString().split('T')[0]}
                  onChange={(e) => setNewAssignment({ ...newAssignment, finalSubmissionDeadline: new Date(e.target.value) })}
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
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  )
}