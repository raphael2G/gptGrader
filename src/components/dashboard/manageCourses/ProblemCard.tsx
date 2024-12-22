import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableHeader, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Edit, Save, X, Trash2 } from 'lucide-react'
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

interface ProblemCardProps {
  problem: IProblem
  index: number
  onUpdateProblem: (problem: IProblem) => void
  onDeleteProblem: () => void
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, index, onUpdateProblem, onDeleteProblem }) => {
  const [editingItemIndex, setEditingItemIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(true)
  const [rubricItems, setRubricItems] = useState<IRubricItem[]>(problem.rubric.items)
  const [totalPoints, setTotalPoints] = useState(problem.maxPoints)
  const [isEditingQuestion, setIsEditingQuestion] = useState(false)
  const [editedQuestion, setEditedQuestion] = useState(problem.question)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const newTotal = rubricItems.reduce((sum, item) => sum + Math.max(item.points, 0), 0)
    setTotalPoints(newTotal)
    // Update problem maxPoints when rubric items change
    if (newTotal !== problem.maxPoints) {
      onUpdateProblem({
        ...problem,
        maxPoints: newTotal
      })
    }
  }, [rubricItems, problem, onUpdateProblem])

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

        const newItems = arrayMove(items, oldIndex, newIndex)
        onUpdateProblem({
          ...problem,
          rubric: { items: newItems }
        })
        return newItems
      })
    }
  }

  const handleSaveRubricItem = (updatedItem: IRubricItem, itemIndex: number) => {
    const updatedRubric = [...rubricItems]
    updatedRubric[itemIndex] = updatedItem
    setRubricItems(updatedRubric)
    onUpdateProblem({
      ...problem,
      rubric: { items: updatedRubric }
    })
    setEditingItemIndex(-1)
  }

  const handleCancelEdit = () => {
    setEditingItemIndex(-1)
  }

  const handleDeleteRubricItem = (itemIndex: number) => {
    const updatedRubric = rubricItems.filter((_, index) => index !== itemIndex)
    setRubricItems(updatedRubric)
    onUpdateProblem({
      ...problem,
      rubric: { items: updatedRubric }
    })
  }

  const handleAddRubricItem = () => {
    const newItem: IRubricItem = {
      description: 'New rubric item',
      points: 0
    }
    const updatedRubric = [...rubricItems, newItem]
    setRubricItems(updatedRubric)
    onUpdateProblem({
      ...problem,
      rubric: { items: updatedRubric }
    })
  }

  const handleEditQuestion = () => {
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
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-0 hover:bg-transparent w-full justify-start"
            >
              <div className="flex items-center group">
                <h4 className="text-md font-semibold mr-2">Rubric</h4>
                <div className="transition-colors duration-200 ease-in-out group-hover:bg-gray-200 dark:group-hover:bg-gray-700 rounded-full p-1">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[70%]">Description</TableHead>
                    <TableHead className="w-[15%] text-right">Points</TableHead>
                    <TableHead className="w-[15%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={rubricItems.map(item => item._id?.toString() || item.description)}
                    strategy={verticalListSortingStrategy}
                  >
                    {rubricItems.map((item, itemIndex) => (
                      <DraggableRubricItem
                        key={item._id?.toString() || itemIndex}
                        id={item._id?.toString() || item.description}
                        item={item}
                        isEditing={editingItemIndex === itemIndex}
                        onEdit={() => setEditingItemIndex(itemIndex)}
                        onSave={(updatedItem) => handleSaveRubricItem(updatedItem, itemIndex)}
                        onCancel={handleCancelEdit}
                        onDelete={() => handleDeleteRubricItem(itemIndex)}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-lg font-semibold">Total Points: {totalPoints}</p>
                <Button onClick={handleAddRubricItem} variant="outline">
                  Add Rubric Item
                </Button>
              </div>
            </DndContext>
          </CollapsibleContent>
        </Collapsible>
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