import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Edit } from 'lucide-react'
import { IAssignment, IProblem } from '@@/models/Assignment'
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface AssignmentDetailsProps {
  assignment: IAssignment
  editedAssignment: IAssignment
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (isOpen: boolean) => void
  setEditedAssignment: (assignment: IAssignment) => void
  handleUpdateAssignment: () => void
  handleStatusChange: () => void
  problems: IProblem[]
}

const StatusBadge = ({ isPublished }: { isPublished: boolean }) => {
  const getStatusStyles = () => {
    return isPublished
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusStyles()}`}>
      {isPublished ? "Published" : "Not Published"}
    </span>
  )
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

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)

  const getStatusDialogMessage = () => {
    const visibilityMessage = assignment.isPublished
      ? 'will no longer see this assignment'
      : 'will now be able to see this assignment'
    
    return {
      title: `${assignment.isPublished ? "Un-publish this assignment" : "Publish this assignment"}?`,
      description: `Are you sure you want to ${assignment.isPublished ? "unpublish" : "publish"} this assignment?  Students ${visibilityMessage}.`
    }
  }

  const validateAndUpdate = () => {
    const dueDate = new Date(editedAssignment.dueDate)
    const lateDeadline = new Date(editedAssignment.finalSubmissionDeadline)

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
    handleUpdateAssignment()
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editedAssignment?.description}
                    onChange={(e) => setEditedAssignment({ ...editedAssignment!, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-due-date">Due Date</Label>
                  <Input
                    id="edit-due-date"
                    type="datetime-local"
                    value={new Date(editedAssignment?.dueDate).toISOString().slice(0, 16)}
                    onChange={(e) => setEditedAssignment({ 
                      ...editedAssignment!, 
                      dueDate: new Date(e.target.value) 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-late-due-date">Late Due Date</Label>
                  <Input
                    id="edit-late-due-date"
                    type="datetime-local"
                    value={new Date(editedAssignment?.finalSubmissionDeadline).toISOString().slice(0, 16)}
                    onChange={(e) => setEditedAssignment({ 
                      ...editedAssignment!, 
                      finalSubmissionDeadline: new Date(e.target.value)
                    })}
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
              <p className="text-sm text-muted-foreground">
                {formatDate(assignment.dueDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-semibold">Late Due:</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(assignment.finalSubmissionDeadline)}
              </p>
            </div>
          </div>
          <div>
            <p className="font-semibold">Status:</p>
            <div onClick={() => setIsStatusDialogOpen(true)} className="cursor-pointer">
              <StatusBadge isPublished={assignment.isPublished} />
            </div>
          </div>
          <div>
            <p className="font-semibold">Problems:</p>
            <p className="text-sm text-muted-foreground">{problems.length}</p>
          </div>
        </div>
      </CardContent>
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getStatusDialogMessage().title}</AlertDialogTitle>
            <AlertDialogDescription>
              {getStatusDialogMessage().description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              handleStatusChange()
              setIsStatusDialogOpen(false)
            }}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}