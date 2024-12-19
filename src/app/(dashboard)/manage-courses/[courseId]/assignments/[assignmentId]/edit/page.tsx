'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BackButton } from '@/components/dashboard/BackButton'
import { AssignmentDetails } from '@/components/dashboard/manageCourses/AssignmentDetails'
import { ProblemList } from '@/components/dashboard/manageCourses/ProblemList'
import { assignmentApi } from '@/api-client/endpoints/assignments'
import { IAssignment, IProblem, IRubricItem } from '@/models/Assignment'
import { Types } from 'mongoose'

export default function EditAssignmentPage({ params }: { params: { courseId: string, assignmentId: string } }) {
  // State management with proper types
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assignment, setAssignment] = useState<IAssignment | null>(null)
  const [editedAssignment, setEditedAssignment] = useState<IAssignment | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProblem, setEditingProblem] = useState<IProblem | null>(null)
  const [isEditProblemDialogOpen, setIsEditProblemDialogOpen] = useState(false)
  const [problems, setProblems] = useState<IProblem[]>([])
  const router = useRouter()

  // Initial data fetching
  useEffect(() => {
    const fetchAssignment = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const { data, error } = await assignmentApi.getAssignmentById(params.assignmentId)
        
        if (error) {
          throw new Error(error.error)
        }
        
        if (!data) {
          throw new Error('Assignment not found')
        }

        setAssignment(data)
        setEditedAssignment(data)
        setProblems(data.problems)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch assignment')
        if (err instanceof Error && err.message === 'Assignment not found') {
          router.push(`/manage-courses/${params.courseId}/assignments`)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssignment()
  }, [params.assignmentId, params.courseId, router])

  // Assignment update handler
  const handleUpdateAssignment = async () => {
    if (!editedAssignment) return

    try {
      setIsLoading(true)
      const updatedData = {
        ...editedAssignment
      }

      const { data, error } = await assignmentApi.update(params.assignmentId, updatedData)
      
      if (error) {
        throw new Error(error.error)
      }

      if (!data) {
        throw new Error('Failed to update assignment')
      }

      setAssignment(data)
      setEditedAssignment(data)
      setIsEditDialogOpen(false)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assignment')
    } finally {
      setIsLoading(false)
    }
  }

  // Status change handler
  const handleStatusChange = async () => {
    if (!assignment) return

    const statusTransitions: Record<AssignmentStatus, AssignmentStatus> = {
      unreleased: 'released',
      released: 'closed',
      closed: 'graded',
      graded: 'unreleased'
    }

    try {
      setIsLoading(true)
      const newStatus = statusTransitions[assignment.status]
      
      const { data, error } = await assignmentApi.update(params.assignmentId, {
        status: newStatus
      })

      if (error) {
        throw new Error(error.error)
      }

      if (!data) {
        throw new Error('Failed to update status')
      }

      setAssignment(data)
      setEditedAssignment(data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setIsLoading(false)
    }
  }

  // Problem management handlers
  const handleEditProblem = (problem: IProblem) => {
    setEditingProblem(problem)
    setIsEditProblemDialogOpen(true)
  }

  const handleUpdateProblem = async (updatedProblem: IProblem) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await assignmentApi.upsertProblem(
        params.assignmentId,
        updatedProblem
      )

      if (error) {
        throw new Error(error.error)
      }

      if (!data) {
        throw new Error('Failed to update problem')
      }

      setAssignment(data)
      setEditedAssignment(data)
      setProblems(data.problems)
      setIsEditProblemDialogOpen(false)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update problem')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProblem = async () => {
    try {
      setIsLoading(true)
      
      const newProblem: Omit<IProblem, '_id'> = {
        question: 'New Problem',
        maxPoints: 0,
        orderIndex: problems.length,
        rubric: {
          items: []
        }
      }

      const { data, error } = await assignmentApi.upsertProblem(
        params.assignmentId,
        newProblem
      )

      if (error) {
        throw new Error(error.error)
      }

      if (!data) {
        throw new Error('Failed to add problem')
      }

      setAssignment(data)
      setEditedAssignment(data)
      setProblems(data.problems)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add problem')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProblem = async (problemId: Types.ObjectId) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await assignmentApi.deleteProblem(
        params.assignmentId,
        problemId
      )

      if (error) {
        throw new Error(error.error)
      }

      if (!data) {
        throw new Error('Failed to delete problem')
      }

      setAssignment(data)
      setEditedAssignment(data)
      setProblems(data.problems)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete problem')
    } finally {
      setIsLoading(false)
    }
  }

  // Loading and error states
  if (isLoading) {
    return (
      <div className="space-y-6">
        <BackButton />
        <div>Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <BackButton />
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  if (!assignment || !editedAssignment) {
    return (
      <div className="space-y-6">
        <BackButton />
        <div>Assignment not found</div>
      </div>
    )
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
        problems={problems}
      />

      <ProblemList
        problems={problems}
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
                value={editingProblem?.question}
                onChange={(e) => setEditingProblem(editingProblem ? {
                  ...editingProblem,
                  question: e.target.value
                } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-problem-points">Max Points</Label>
              <Input
                id="edit-problem-points"
                type="number"
                value={editingProblem?.maxPoints}
                onChange={(e) => setEditingProblem(editingProblem ? {
                  ...editingProblem,
                  maxPoints: parseInt(e.target.value)
                } : null)}
              />
            </div>
          </div>
          <Button onClick={() => {
            if (editingProblem) {
              handleUpdateProblem(editingProblem)
            }
          }}>Save Changes</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}