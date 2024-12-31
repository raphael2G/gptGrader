import React, { useState } from 'react'
import { Table, TableBody, TableHeader, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { IRubricItem } from '@/models/Assignment'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableRubricItem } from '@/components/dashboard/manageCourses/DraggableRubricItem'
import { Skeleton } from "@/components/ui/skeleton"
import { 
  useGetAssignmentById,
  useUpsertRubricItem, 
  useDeleteRubricItem 
} from "@/hooks/queries/useAssignments"
import { toast } from "sonner"

interface RubricProps {
  assignmentId: string;
  problemId: string;
  disabled?: boolean;
  defaultOpen?: boolean;
}

export const RubricSection: React.FC<RubricProps> = ({ 
  assignmentId,
  problemId,
  disabled = false,
  defaultOpen = true
}) => {
  // Local state
  const [editingItemIndex, setEditingItemIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Fetch assignment data
  const { 
    data: assignment,
    isLoading: isAssignmentLoading,
    error: assignmentError
  } = useGetAssignmentById(assignmentId)

  // Get the current problem and its rubric items
  const problem = assignment?.problems?.find(p => p._id?.toString() === problemId)
  const rubricItems = problem?.rubric?.items || []

  // Calculate total points (with null checks)
  const totalPoints = rubricItems?.reduce((sum, item) => {
    return sum + (Math.max(item?.points || 0, 0))
  }, 0) || 0

  // Mutations
  const { 
    mutate: upsertRubricItem,
    isPending: isUpsertPending
  } = useUpsertRubricItem()

  const {
    mutate: deleteRubricItem,
    isPending: isDeletePending
  } = useDeleteRubricItem()

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    if (disabled || isUpsertPending || !rubricItems) return
    const { active, over } = event

    if (!active?.id || !over?.id || active.id === over.id) return

    const oldIndex = rubricItems.findIndex((item) => item?._id?.toString() === active.id)
    const newIndex = rubricItems.findIndex((item) => item?._id?.toString() === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newItems = arrayMove(rubricItems, oldIndex, newIndex)
    handleUpdateRubricItems(newItems)
  }

  const handleUpdateRubricItems = (items: IRubricItem[]) => {
    if (!items?.length) return

    items.forEach((item, index) => {
      if (!item) return

      upsertRubricItem(
        {
          assignmentId,
          problemId,
          rubricItemData: item
        },
        {
          onError: () => {
            toast.error('Failed to update rubric item order')
          }
        }
      )
    })
  }

  const handleSaveRubricItem = (updatedItem: IRubricItem, itemIndex: number) => {
    if (disabled || isUpsertPending || !updatedItem) return

    upsertRubricItem(
      {
        assignmentId,
        problemId,
        rubricItemData: updatedItem
      },
      {
        onSuccess: () => {
          setEditingItemIndex(-1)
          toast.success('Rubric item updated')
        },
        onError: () => {
          toast.error('Failed to update rubric item')
        }
      }
    )
  }

  const handleDeleteRubricItem = (itemId: string | undefined) => {
    if (disabled || isDeletePending || !itemId) return

    deleteRubricItem(
      {
        assignmentId,
        problemId,
        itemId
      },
      {
        onSuccess: () => {
          toast.success('Rubric item deleted')
        },
        onError: () => {
          toast.error('Failed to delete rubric item')
        }
      }
    )
  }

  const handleAddRubricItem = () => {
    if (disabled || isUpsertPending) return

    const newItem: Partial<IRubricItem> = {
      description: 'New rubric item',
      points: 0,
    }

    upsertRubricItem(
      {
        assignmentId,
        problemId,
        rubricItemData: newItem
      },
      {
        onSuccess: () => {
          toast.success('New rubric item added')
        },
        onError: () => {
          toast.error('Failed to add rubric item')
        }
      }
    )
  }

  const isLoading = isAssignmentLoading || isUpsertPending || isDeletePending

  // Error state
  if (assignmentError) {
    return (
      <div className="text-red-500 p-4">
        Failed to load rubric. Please try again.
      </div>
    )
  }

  // Loading skeleton
  if (isAssignmentLoading || !assignment || !problem) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }



  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen} 
      className="mt-4"
    >
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-0 hover:bg-transparent w-full justify-start"
          disabled={disabled}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center group">
              <h4 className="text-md font-semibold mr-2">Rubric</h4>
              <div className="transition-colors duration-200 ease-in-out group-hover:bg-gray-200 dark:group-hover:bg-gray-700 rounded-full p-1">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
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
            <TableBody className={isLoading ? 'opacity-50' : ''}>
              <SortableContext
                items={rubricItems.map(item => item._id?.toString() || item.description)}
                strategy={verticalListSortingStrategy}
              >
                {rubricItems.map((item, itemIndex) => (
                  <DraggableRubricItem
                    key={item._id?.toString() || `${item.description}-${itemIndex}`}
                    id={item._id?.toString() || `${item.description}-${itemIndex}`}
                    item={item}
                    isEditing={editingItemIndex === itemIndex}
                    onEdit={() => setEditingItemIndex(itemIndex)}
                    onSave={(updatedItem) => handleSaveRubricItem(updatedItem, itemIndex)}
                    onCancel={() => setEditingItemIndex(-1)}
                    onDelete={() => handleDeleteRubricItem(item._id?.toString())}
                    disabled={disabled || isLoading}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
          
          <div className="mt-4 flex justify-between items-center">
            <p className="text-lg font-semibold">
              Total Points: {totalPoints}
            </p>
            <Button 
              onClick={handleAddRubricItem} 
              variant="outline"
              disabled={disabled || isLoading}
            >
              {isUpsertPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Add Rubric Item
            </Button>
          </div>
        </DndContext>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default RubricSection