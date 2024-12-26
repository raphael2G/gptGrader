'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/various/BackButton'
import { assignmentApi } from '@@/lib/client-api/assignments'
import { useToast } from "@/components/ui/use-toast"
import { AssignmentDetails } from '@/components/dashboard/manageCourses/AssignmentDetails'
import { ProblemList } from '@/components/dashboard/manageCourses/ProblemList'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

import { IAssignment, IProblem } from '@/models/Assignment'
import { useGetAssignmentById } from '@/hooks/queries/useAssignments'

export default function AssignmentDetailsPage({ params }: { params: { courseId: string, assignmentId: string } }) {
  // const [assignment, setAssignment] = useState<IAssignment | null>(null)
  const [editedAssignment, setEditedAssignment] = useState<IAssignment | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProblem, setEditingProblem] = useState<IProblem | null>(null)
  const [isEditProblemDialogOpen, setIsEditProblemDialogOpen] = useState(false)
  // const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const { toast } = useToast()

  const {data: assignment, isLoading: isGettingAssignment, error: errorGettingAssignment} = useGetAssignmentById(params.assignmentId)

  // useEffect(() => {
  //   fetchAssignment()
  // }, [params.assignmentId])

  // const fetchAssignment = async () => {
  //   setLoading(true)
  //   try {
  //     const response = await assignmentApi.getAssignmentById(params.assignmentId)
  //     if (response.data) {
  //       setAssignment(response.data)
  //       setEditedAssignment(response.data)
  //     } else {
  //       throw new Error(response.error?.error || 'Failed to fetch assignment')
  //     }
  //   } catch (err) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to fetch assignment details.",
  //       variant: "destructive",
  //     })
  //     router.push(`/manage-courses/${params.courseId}/assignments`)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  if (isGettingAssignment) return <div>Fetching the assignment...</div>
  if (errorGettingAssignment) {
    toast({
      title: "Something went wrong getting this assignment.",
      description: errorGettingAssignment?.message || "Please try again later",
      variant: "destructive"
    })
    router.push("/manage-courses/{params.courseId}/assignments")
    return <div>There was an issue getting your course. {errorGettingAssignment?.message}</div>;
  }


  const handleUpdateAssignment = async () => {
    if (!assignment || !editedAssignment) return

    try {
      const response = await assignmentApi.updateAssignment(
        assignment._id.toString(),
        {
          title: editedAssignment.title,
          description: editedAssignment.description,
          dueDate: editedAssignment.dueDate,
          lateDueDate: editedAssignment.lateDueDate,
          status: editedAssignment.status,
          totalPoints: editedAssignment.totalPoints
        }
      )

      if (response.data) {
        setAssignment(response.data)
        setEditedAssignment(response.data)
        setIsEditDialogOpen(false)
        toast({
          title: "Success",
          description: "Assignment updated successfully.",
        })
      } else {
        throw new Error(response.error?.error || 'Failed to update assignment')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update assignment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async () => {
    if (!assignment) return


    setAssignment({ ...assignment, isPublished: !assignment.isPublished })
    setEditedAssignment(prev => prev ? { ...prev, isPublished: !assignment.isPublished } : null)
    
    try {
      const response = await assignmentApi.updateAssignment(
        assignment._id.toString(),
        { isPublished: !assignment.isPublished }
      )

      if (!response.data) {
        throw new Error(response.error?.error || 'Failed to update status')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update assignment status.",
        variant: "destructive",
      })
    }
  }

  const handleEditProblem = (problem: IProblem) => {
    setEditingProblem(problem)
    setIsEditProblemDialogOpen(true)
  }

  const handleUpdateProblem = async (updatedProblem: IProblem) => {
    if (!assignment) return

    try {
      const response = await assignmentApi.updateProblem(
        assignment._id.toString(),
        updatedProblem._id.toString(),
        updatedProblem
      )

      if (response.data) {
        setAssignment(response.data)
        setEditedAssignment(response.data)
        setIsEditProblemDialogOpen(false)
        toast({
          title: "Success",
          description: "Problem updated successfully.",
        })
      } else {
        throw new Error(response.error?.error || 'Failed to update problem')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update problem. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddProblem = async () => {
    if (!assignment) return

    const newProblem: Partial<IProblem> = {
      question: 'New Problem',
      maxPoints: 0,
      orderIndex: assignment.problems.length,
      rubric: { items: [] }
    }

    try {
      const response = await assignmentApi.addProblemToAssignment(
        assignment._id.toString(),
        newProblem as IProblem
      )

      if (response.data) {
        setAssignment(response.data)
        setEditedAssignment(response.data)
        toast({
          title: "Success",
          description: "Problem added successfully.",
        })
      } else {
        throw new Error(response.error?.error || 'Failed to add problem')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add problem. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProblem = async (problemId: string) => {
    if (!assignment) return

    // Note: The API doesn't have a direct deleteProblem method, so we'll update the assignment
    // by filtering out the problem
    try {
      const updatedProblems = assignment.problems.filter(p => p._id.toString() !== problemId)
      const response = await assignmentApi.updateAssignment(
        assignment._id.toString(),
        { problems: updatedProblems }
      )

      if (response.data) {
        setAssignment(response.data)
        setEditedAssignment(response.data)
        toast({
          title: "Success",
          description: "Problem deleted successfully.",
        })
      } else {
        throw new Error(response.error?.error || 'Failed to delete problem')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete problem. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!assignment || !editedAssignment) {
    return <div>Assignment not found</div>
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">Assignment Details: {assignment.title}</h1>

      <AssignmentDetails
        assignment={assignment}
        editedAssignment={editedAssignment}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        setEditedAssignment={setEditedAssignment}
        handleUpdateAssignment={handleUpdateAssignment}
        handleStatusChange={handleStatusChange}
        problems={assignment.problems}
      />

      <ProblemList
        problems={assignment.problems}
        onEditProblem={handleEditProblem}
        onUpdateProblem={handleUpdateProblem}
        onAddProblem={handleAddProblem}
        onDeleteProblem={handleDeleteProblem}
      />

      <Dialog open={isEditProblemDialogOpen} onOpenChange={setIsEditProblemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Problem</DialogTitle>
            <DialogDescription>Make changes to the problem details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-problem-question">Question</Label>
              <Textarea
                id="edit-problem-question"
                value={editingProblem?.question || ''}
                onChange={(e) => setEditingProblem(prev => prev ? { ...prev, question: e.target.value } : null)}
              />
            </div>
          </div>
          <Button onClick={() => editingProblem && handleUpdateProblem(editingProblem)}>
            Save Changes
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}