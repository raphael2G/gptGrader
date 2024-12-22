import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableHeader, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { IRubricItem } from '@@/models/Assignment'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableRubricItem } from '@/components/dashboard/manageCourses/DraggableRubricItem'

interface RubricProps {
  rubricItems: IRubricItem[]
  onUpdateRubric: (items: IRubricItem[]) => void
  defaultOpen?: boolean
}

export const RubricSection: React.FC<RubricProps> = ({ 
  rubricItems,
  onUpdateRubric,
  defaultOpen = true
}) => {
  const [editingItemIndex, setEditingItemIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [items, setItems] = useState<Array<IRubricItem>>([])
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    if (rubricItems?.length>0) {setItems(rubricItems)}
    const newTotal = items?.length > 0 ? items.reduce((sum, item) => sum + Math.max(item.points, 0), 0) : 0
    setTotalPoints(newTotal)
  }, [items])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.description === active.id)
        const newIndex = currentItems.findIndex((item) => item.description === over?.id)

        const newItems = arrayMove(currentItems, oldIndex, newIndex)
        onUpdateRubric(newItems)
        return newItems
      })
    }
  }

  const handleSaveRubricItem = (updatedItem: IRubricItem, itemIndex: number) => {
    const updatedItems = [...items]
    updatedItems[itemIndex] = updatedItem
    setItems(updatedItems)
    onUpdateRubric(updatedItems)
    setEditingItemIndex(-1)
  }

  const handleCancelEdit = () => {
    setEditingItemIndex(-1)
  }

  const handleDeleteRubricItem = (itemIndex: number) => {
    const updatedItems = items.filter((_, index) => index !== itemIndex)
    setItems(updatedItems)
    onUpdateRubric(updatedItems)
  }

  const handleAddRubricItem = () => {
    const newItem: IRubricItem = {
      description: 'New rubric item',
      points: 0
    }
    const updatedItems = [...items, newItem]
    setItems(updatedItems)
    onUpdateRubric(updatedItems)
  }

  return (
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

              {items?.length > 0 && 
              <SortableContext
                items={items?.map(item => item.description || item.description)}
                strategy={verticalListSortingStrategy}
              >
                {items?.map((item, itemIndex) => (
                  <DraggableRubricItem
                    key={item.description || item.description}
                    id={item.description || item.description}
                    item={item}
                    isEditing={editingItemIndex === itemIndex}
                    onEdit={() => setEditingItemIndex(itemIndex)}
                    onSave={(updatedItem) => handleSaveRubricItem(updatedItem, itemIndex)}
                    onCancel={handleCancelEdit}
                    onDelete={() => handleDeleteRubricItem(itemIndex)}
                  />
                ))}
              </SortableContext>}
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
  )
}
