import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableHeader, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Edit, Save, X, Trash2 } from 'lucide-react'
import { IProblem, IRubricItem } from '@@/models/Assignment'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableRubricItem } from '@/components/dashboard/manageCourses/DraggableRubricItem'
import { Textarea } from "@/components/ui/textarea"
import { IProblem, IRubricItem } from '@/models/Assignment'
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

interface ProblemCardProps {
  problem: IProblem
  problem: IProblem
  index: number
  onEdit: () => void
  onUpdateProblem: (problem: IProblem) => void
  onDeleteProblem: (problemId: string) => void
}

const ProblemCard: React.FC<ProblemCardProps> = ({ 
  problem, 
  index, 
  onEdit, 
  onUpdateProblem, 
  onDeleteProblem 
}) => {
  const [editingItemIndex, setEditingItemIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(true)
  const [rubricItems, setRubricItems] = useState<IRubricItem[]>(problem.rubric.items)
  const [totalPoints, setTotalPoints] = useState(problem.maxPoints)
  const [isEditingQuestion, setIsEditingQuestion] = useState(false)
  const [editedQuestion, setEditedQuestion] = useState(problem.question)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const newTotal = rubricItems?.length > 0 ? rubricItems.reduce((sum, item) => sum + Math.max(item.points, 0), 0) : 0
    setTotalPoints(newTotal)
    // Update problem's maxPoints when rubric items change
    if (newTotal !== problem.maxPoints) {
      onUpdateProblem({ ...problem, maxPoints: newTotal })
    }
  }, [rubricItems])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setRubricItems((items) => {
        const oldIndex = items.findIndex((item) => item._id?.toString() === active.id)
        const newIndex = items.findIndex((item) => item._id?.toString() === over?.id)
        const oldIndex = items.findIndex((item) => item._id?.toString() === active.id)
        const newIndex = items.findIndex((item) => item._id?.toString() === over?.id)

        const newItems = arrayMove(items, oldIndex, newIndex)
        onUpdateProblem({ ...problem, rubric: { items: newItems } })
        return newItems
      })
    }
  }

  const handleSaveRubricItem = (updatedItem: IRubricItem, itemIndex: number) => {
  const handleSaveRubricItem = (updatedItem: IRubricItem, itemIndex: number) => {
    const updatedRubric = [...rubricItems]
    updatedRubric[itemIndex] = updatedItem
    setRubricItems(updatedRubric)
    onUpdateProblem({ ...problem, rubric: { items: updatedRubric } })
    setEditingItemIndex(-1)
  }

  const handleCancelEdit = () => {
    setEditingItemIndex(-1)
  }

  const handleDeleteRubricItem = (itemIndex: number) => {
    const updatedRubric = rubricItems.filter((_, index) => index !== itemIndex)
    setRubricItems(updatedRubric)
    onUpdateProblem({ ...problem, rubric: { items: updatedRubric } })
  }

  const handleAddRubricItem = () => {
    const newItem: IRubricItem = {
    const newItem: IRubricItem = {
      description: 'New rubric item',
      points: 0
    }
    const updatedRubric = [...rubricItems, newItem]
    setRubricItems(updatedRubric)
    onUpdateProblem({ ...problem, rubric: { items: updatedRubric } })
  }

  const handleEditQuestion = () => {
    setIsEditingQuestion(true)
    setEditedQuestion(problem.question)
  }
    setIsEditingQuestion(true)
    setEditedQuestion(problem.question)
  }

  const handleSaveQuestion = () => {
    onUpdateProblem({
      ...problem,
      question: editedQuestion
    })
    setIsEditingQuestion(false)
  }

  const handleCancelEditQuestion = () => {
    setIsEditingQuestion(false)
    setEditedQuestion(problem.question)
  }

  const handleDeleteProblem = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteProblem = () => {
    if (problem._id) {
      onDeleteProblem()
    }
    setIsDeleteDialogOpen(false)
  }

  const handleUpdateRubric = (items: IRubricItem[]) => {
    const totalPoints = items.reduce((sum, item) => sum + Math.max(item.points, 0), 0)
    onUpdateProblem({ 
      ...problem, 
      maxPoints: totalPoints,
      rubric: { items } 
    })
  }

  return (
    <Card className="mb-6">
      <CardHeader onClick={(e) => e.stopPropagation()} className="relative">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">Question {index + 1}:</h3>
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 hover:bg-red-100 dark:hover:bg-red-900"
            onClick={handleDeleteProblem}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative group cursor-pointer mt-2">
          {!isEditingQuestion && (
            <div className="flex items-center justify-between group">
              <p 
                className="text-gray-700 dark:text-gray-300 cursor-pointer flex-grow hover:underline pr-8"
                onClick={handleEditQuestion}
              >
                {problem.question}
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-0 top-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                onClick={handleEditQuestion}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
          {isEditingQuestion && (
            <div className="space-y-2">
              <Textarea
                value={editedQuestion}
                onChange={(e) => setEditedQuestion(e.target.value)}
                className="w-full p-2 text-gray-700 dark:text-gray-300 bg-transparent"
                autoFocus
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={(e) => { e.stopPropagation(); handleSaveQuestion(); }}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleCancelEditQuestion(); }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <RubricSection 
          rubricItems={problem.rubric}
          onUpdateRubric={handleUpdateRubric}
        />
      </CardContent>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this problem?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This problem will be permanently deleted from the assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProblem}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export default ProblemCard