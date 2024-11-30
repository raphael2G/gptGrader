import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Edit, Save, X } from 'lucide-react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RubricItem } from '@/lib/dummy/courses'
import { cn } from "@/lib/utils"

interface DraggableRubricItemProps {
  id: string
  item: RubricItem
  isEditing: boolean
  onEdit: () => void
  onSave: (updatedItem: RubricItem) => void
  onCancel: () => void
  onDelete: () => void
}

export function DraggableRubricItem({ 
  id, 
  item, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete 
}: DraggableRubricItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  }

  const [description, setDescription] = React.useState(item.description)
  const [points, setPoints] = React.useState(item.points)

  React.useEffect(() => {
    if (isEditing) {
      setDescription(item.description)
      setPoints(item.points)
    }
  }, [isEditing, item])

  const handleSave = () => {
    onSave({ description, points })
  }

  const isPositive = item.points >= 0

  return (
    <TableRow ref={setNodeRef} style={style} className={cn(
      "relative",
      isEditing ? "bg-gray-100 dark:bg-zinc-900" : "",
      !isEditing && isPositive ? "bg-green-50 dark:bg-green-900/20" : "",
      !isEditing && !isPositive ? "bg-red-50 dark:bg-red-900/20" : ""
    )}>
      <TableCell>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2"
          aria-label="Drag handle"
          role="button"
          tabIndex={0}
        >
          <GripVertical className="h-5 w-5 text-gray-500" />
        </div>
      </TableCell>
      <TableCell className="w-[100%]" onClick={() => !isEditing && onEdit()}>
        {isEditing ? (
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[2.5rem] resize-y dark:bg-black"
          />
        ) : (
          <span className={cn(
            "cursor-pointer hover:underline",
            isPositive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
          )}>
            {item.description}
          </span>
        )}
      </TableCell>
      <TableCell className="w-[15%] text-right" onClick={() => !isEditing && onEdit()}>
        {isEditing ? (
          <Input
            type="number"
            value={points}
            onChange={(e) => setPoints(parseFloat(e.target.value))}
            className="w-20 text-right dark:bg-black"
          />
        ) : (
          <span className={cn(
            "font-medium cursor-pointer hover:underline",
            isPositive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
          )}>
            {item.points > 0 ? "+" : ""}{item.points}
          </span>
        )}
      </TableCell>
      <TableCell className="w-[15%]">
        <div className="flex justify-end space-x-2">
          {isEditing ? (
            <>
              <Button size="sm" variant="ghost" onClick={handleSave} className="hover:bg-green-100 dark:hover:bg-green-900">
                <Save className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancel} className="hover:bg-yellow-100 dark:hover:bg-yellow-900">
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={onEdit} className="hover:bg-blue-100 dark:hover:bg-blue-900">
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onDelete} className="hover:bg-red-100 dark:hover:bg-red-900">
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

