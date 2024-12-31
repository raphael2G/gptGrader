import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Edit, Save, X, Trash2, Loader2 } from 'lucide-react'
import { IProblem, IRubricItem } from '@/models/Assignment'
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RubricSection } from "@/components/various/RubricSection"
import { useUpsertProblem, useDeleteProblem } from "@/hooks/queries/useAssignments"
import { toast } from "sonner"

interface ProblemCardProps {
  problem: IProblem;
  assignmentId: string;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ 
  problem,
  assignmentId
}) => {
  // Local state
  const [isEditingQuestion, setIsEditingQuestion] = useState(false)
  const [editedQuestion, setEditedQuestion] = useState(problem.question)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Mutations with loading states
  const { 
    mutate: upsertProblem, 
    isPending: isUpsertPending 
  } = useUpsertProblem()
  
  const { 
    mutate: deleteProblem, 
    isPending: isDeletePending 
  } = useDeleteProblem()

  // Handlers for question editing
  const handleEditQuestion = () => {
    setIsEditingQuestion(true)
    setEditedQuestion(problem.question)
  }

  const handleSaveQuestion = () => {
    if (isUpsertPending) return

    upsertProblem(
      {
        assignmentId,
        problemData: { ...problem, question: editedQuestion }
      },
      {
        onSuccess: () => {
          setIsEditingQuestion(false)
          toast.success('Question updated successfully')
        },
        onError: () => {
          toast.error('Failed to update question')
        }
      }
    )
  }

  const handleCancelEditQuestion = () => {
    setIsEditingQuestion(false)
    setEditedQuestion(problem.question)
  }

  // Handlers for problem deletion
  const handleDeleteProblem = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteProblem = () => {
    if (isDeletePending) return

    deleteProblem(
      {
        assignmentId,
        problemId: problem._id?.toString() || ''
      },
      {
        onSuccess: () => {
          toast.success('Problem deleted successfully')
          setIsDeleteDialogOpen(false)
        },
        onError: () => {
          toast.error('Failed to delete problem')
          setIsDeleteDialogOpen(false)
        }
      }
    )
  }

  // Handler for rubric updates
  const handleUpdateRubric = (items: IRubricItem[]) => {
    if (isUpsertPending) return
    
    const totalPoints = items.reduce((sum, item) => sum + Math.max(item.points, 0), 0)
    
    upsertProblem(
      {
        assignmentId,
        problemData: {
          ...problem,
          maxPoints: totalPoints,
          rubric: { items }
        }
      },
      {
        onSuccess: () => {
          toast.success('Rubric updated successfully')
        },
        onError: () => {
          toast.error('Failed to update rubric')
        }
      }
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader className="relative">
        {/* Question header */}
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">Question {problem.orderIndex + 1}:</h3>
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 hover:bg-red-100 dark:hover:bg-red-900"
            onClick={handleDeleteProblem}
            disabled={isDeletePending || isUpsertPending}
          >
            {isDeletePending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Question content */}
        <div className="relative group cursor-pointer mt-2">
          {!isEditingQuestion ? (
            <div className="flex items-center justify-between group">
              <p 
                className={`text-gray-700 dark:text-gray-300 cursor-pointer flex-grow hover:underline pr-8 
                  ${(isUpsertPending || isDeletePending) ? 'opacity-50' : ''}`}
                onClick={handleEditQuestion}
              >
                {problem.question}
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-0 top-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                onClick={handleEditQuestion}
                disabled={isUpsertPending || isDeletePending}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={editedQuestion}
                onChange={(e) => setEditedQuestion(e.target.value)}
                className="w-full p-2 text-gray-700 dark:text-gray-300 bg-transparent"
                disabled={isUpsertPending}
                autoFocus
              />
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleSaveQuestion}
                  disabled={isUpsertPending}
                >
                  {isUpsertPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCancelEditQuestion}
                  disabled={isUpsertPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Rubric section */}
      <CardContent>
        <RubricSection 
          assignmentId={assignmentId}
          problemId={problem._id.toString()}
          disabled={isUpsertPending || isDeletePending}
          defaultOpen={false}
        />
      </CardContent>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this problem?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This problem will be permanently deleted from the assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletePending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProblem}
              disabled={isDeletePending}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeletePending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export default ProblemCard