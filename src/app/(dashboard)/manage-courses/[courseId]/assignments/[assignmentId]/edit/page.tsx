'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BackButton } from '@/components/dashboard/BackButton'
import { getInstructorCourses, updateInstructorCourse, InstructorCourse, InstructorAssignment, AssignmentStatus } from '@/lib/dummy/instructorCourses'
import {Problem} from '@/lib/dummy/courses'   
import { AssignmentDetails } from '@/components/dashboard/manageCourses/AssignmentDetails'
import { ProblemList } from '@/components/dashboard/manageCourses/ProblemList'

export default function EditAssignmentPage({ params }: { params: { courseId: string, assignmentId: string } }) {
  const [course, setCourse] = useState<InstructorCourse | null>(null)
  const [assignment, setAssignment] = useState<InstructorAssignment | null>(null)
  const [editedAssignment, setEditedAssignment] = useState<InstructorAssignment | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null)
  const [isEditProblemDialogOpen, setIsEditProblemDialogOpen] = useState(false)
  const [problems, setProblems] = useState<Problem[]>([]) // Added state for problems
  const router = useRouter()

  useEffect(() => {
    const foundCourse = getInstructorCourses().find((c: any) => c.id === params.courseId)
    if (foundCourse) {
      setCourse(foundCourse)
      const foundAssignment = foundCourse.assignments.find((a: any) => a.id === params.assignmentId)
      if (foundAssignment) {
        setAssignment(foundAssignment)
        setEditedAssignment(foundAssignment)
        setProblems(foundAssignment.problems) // Update to set problems state
      } else {
        router.push(`/manage-courses/${params.courseId}/assignments`)
      }
    } else {
      router.push('/manage-courses')
    }
  }, [params.courseId, params.assignmentId, router])

  const handleUpdateAssignment = () => {
    if (course && editedAssignment) {
      const updatedAssignment = { ...editedAssignment, problems: problems } // Update to include problems
      const updatedCourse = {
        ...course,
        assignments: course.assignments.map(a =>
          a.id === updatedAssignment.id ? updatedAssignment : a
        )
      }
      updateInstructorCourse(updatedCourse)
      setAssignment(updatedAssignment)
      setEditedAssignment(updatedAssignment)
      setIsEditDialogOpen(false)
    }
  }

  const handleStatusChange = () => {
    if (assignment) {
      const nextStatus: Record<AssignmentStatus, AssignmentStatus> = {
        unreleased: 'released',
        released: 'closed',
        closed: 'unreleased'
      }
      const newStatus = nextStatus[assignment.status]
      setAssignment({ ...assignment, status: newStatus })
      setEditedAssignment({ ...editedAssignment!, status: newStatus })
    }
  }

  const handleEditProblem = (problem: Problem) => {
    setEditingProblem(problem)
    setIsEditProblemDialogOpen(true)
  }

  const handleUpdateProblem = (updatedProblem: Problem) => {
    const updatedProblems = problems.map(p =>
      p.id === updatedProblem.id ? updatedProblem : p
    )
    setProblems(updatedProblems)
    if (editedAssignment) {
      const updatedAssignment = { ...editedAssignment, problems: updatedProblems }
      setEditedAssignment(updatedAssignment)
      handleUpdateAssignment()
    }
  }

  const handleAddProblem = () => {
    const newProblem: Problem = {
      id: `problem-${Date.now()}`,
      question: 'New Problem',
      rubric: [], 
      maxPoints: undefined
    }
    const updatedProblems = [...problems, newProblem]
    setProblems(updatedProblems)
    if (editedAssignment) {
      const updatedAssignment = {
        ...editedAssignment,
        problems: updatedProblems
      }
      setEditedAssignment(updatedAssignment)
      handleUpdateAssignment()
    }
  }

  const handleDeleteProblem = (problemId: string) => {
    const updatedProblems = problems.filter(p => p.id !== problemId)
    setProblems(updatedProblems)
    if (editedAssignment) {
      const updatedAssignment = { ...editedAssignment, problems: updatedProblems }
      setEditedAssignment(updatedAssignment)
      handleUpdateAssignment()
    }
  }

  if (!course || !assignment) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">Assignment Details: {assignment.title}</h1>

      <AssignmentDetails
        assignment={assignment}
        editedAssignment={editedAssignment!}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        setEditedAssignment={setEditedAssignment}
        handleUpdateAssignment={handleUpdateAssignment}
        handleStatusChange={handleStatusChange}
        problems={problems} // Add this line
      />

      <ProblemList
        problems={problems} // Updated to use the problems state
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
                onChange={(e) => setEditingProblem({ ...editingProblem!, question: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={() => {
            if (editingProblem) {
              handleUpdateProblem(editingProblem)
              setIsEditProblemDialogOpen(false)
            }
          }}>Save Changes</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

