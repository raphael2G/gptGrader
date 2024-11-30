import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Edit } from 'lucide-react'
import { InstructorAssignment } from '@/lib/dummy/instructorCourses'
import { StatusBadge } from '@/components/dashboard/manageCourses/StatusBadge'
import { Problem } from '@/lib/dummy/courses'
import { useToast } from "@/hooks/use-toast"

interface AssignmentDetailsProps {
  assignment: InstructorAssignment
  editedAssignment: InstructorAssignment
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (isOpen: boolean) => void
  setEditedAssignment: (assignment: InstructorAssignment) => void
  handleUpdateAssignment: () => void
  handleStatusChange: () => void
  problems: Problem[]
}

export function AssignmentDetails({
  assignment,
  editedAssignment,
  isEditDialogOpen,
  setIsEditDialogOpen,
  setEditedAssignment,
  handleUpdateAssignment,
  handleStatusChange,
  problems
}: AssignmentDetailsProps) {
  const { toast } = useToast()
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateAndUpdate = () => {
    const dueDate = new Date(editedAssignment.dueDate)
    const lateDeadline = new Date(editedAssignment.finalSubmissionDeadline)

    if (lateDeadline < dueDate) {
      setValidationError("Late submission deadline cannot be before the due date.")
      toast({
        title: "Validation Error",
        description: "Late submission deadline cannot be before the due date.",
        variant: "destructive",
      })
      return
    }

    setValidationError(null)
    handleUpdateAssignment()
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
                    type="date"
                    value={editedAssignment?.dueDate}
                    onChange={(e) => setEditedAssignment({ ...editedAssignment!, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-late-deadline">Late Submission Deadline</Label>
                  <Input
                    id="edit-late-deadline"
                    type="date"
                    value={editedAssignment?.finalSubmissionDeadline}
                    onChange={(e) => setEditedAssignment({ ...editedAssignment!, finalSubmissionDeadline: e.target.value })}
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
              <p className="text-sm text-muted-foreground">{assignment.dueDate}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-semibold">Late Deadline:</p>
              <p className="text-sm text-muted-foreground">{assignment.finalSubmissionDeadline}</p>
            </div>
          </div>
          <div>
            <p className="font-semibold">Status:</p>
            <div onClick={handleStatusChange}>
              <StatusBadge status={assignment.status} />
            </div>
          </div>
          <div>
            <p className="font-semibold">Problem Count:</p>
            <p className="text-sm text-muted-foreground">{problems.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

