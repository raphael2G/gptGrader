import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Edit } from 'lucide-react'
import { IAssignment } from '@/models/Assignment'
import { StatusBadge } from '@/components/dashboard/manageCourses/StatusBadge'
import { useToast } from "@/hooks/use-toast"
import { assignmentApi } from '@/api-client/endpoints/assignments'

interface AssignmentDetailsProps {
  assignment: IAssignment
  editedAssignment: IAssignment
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (isOpen: boolean) => void
  setEditedAssignment: (assignment: IAssignment) => void
  handleUpdateAssignment: () => void
}

export function AssignmentDetails({
  assignment,
  editedAssignment,
  isEditDialogOpen,
  setIsEditDialogOpen,
  setEditedAssignment,
  handleUpdateAssignment,
}: AssignmentDetailsProps) {
  const { toast } = useToast()
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateAndUpdate = async () => {
    const dueDate = new Date(editedAssignment.dueDate)
    const lateDeadline = new Date(editedAssignment.lateDueDate)

    if (lateDeadline < dueDate) {
      setValidationError("Late due date cannot be before the due date.")
      toast({
        title: "Validation Error",
        description: "Late due date cannot be before the due date.",
        variant: "destructive",
      })
      return
    }

    setValidationError(null)

    const { data, error } = await assignmentApi.update(assignment._id!.toString(), {
      title: editedAssignment.title,
      dueDate: editedAssignment.dueDate,
      lateDueDate: editedAssignment.lateDueDate,
    })

    if (error) {
      toast({
        title: "Error updating assignment",
        description: error.details || error.error,
        variant: "destructive",
      })
    } else {
      handleUpdateAssignment()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div>
            <p className="font-semibold">Title:</p>
            <p>{assignment.title}</p>
          </div>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Assignment</DialogTitle>
                <DialogDescription>Make changes to the assignment details.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editedAssignment?.title}
                    onChange={(e) => setEditedAssignment({ ...editedAssignment!, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-due-date">Due Date</Label>
                  <Input
                    id="edit-due-date"
                    type="datetime-local"
                    value={editedAssignment?.dueDate.toString().slice(0, 16)}
                    onChange={(e) => setEditedAssignment({ ...editedAssignment!, dueDate: new Date(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-late-deadline">Late Due Date</Label>
                  <Input
                    id="edit-late-deadline"
                    type="datetime-local"
                    value={editedAssignment?.lateDueDate.toString().slice(0, 16)}
                    onChange={(e) => setEditedAssignment({ ...editedAssignment!, lateDueDate: new Date(e.target.value) })}
                  />
                </div>
                {validationError && (
                  <p className="text-sm text-red-500">{validationError}</p>
                )}
              </div>
              <Button onClick={validateAndUpdate}>Save Changes</Button>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-semibold">Due:</p>
              <p className="text-sm text-muted-foreground">{assignment.dueDate.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-semibold">Late Due Date:</p>
              <p className="text-sm text-muted-foreground">{assignment.lateDueDate.toLocaleString()}</p>
            </div>
          </div>
          <div>
            <p className="font-semibold">Status:</p>
            <StatusBadge status={assignment.status} />
          </div>
          <div>
            <p className="font-semibold">Problem Count:</p>
            <p className="text-sm text-muted-foreground">{assignment.problems.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}