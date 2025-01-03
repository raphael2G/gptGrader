import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bold, CalendarIcon, Edit, Loader2 } from 'lucide-react'
import { IAssignment } from '@/models/Assignment'
import { useRouter } from 'next/navigation'
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
} from "@/components/ui/alert-dialog"
import { 
  useGetAssignmentById,
  useUpdateAssignment
} from '@/hooks/queries/useAssignments'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Skeleton loader component for assignment details
const AssignmentDetailsSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-48 bg-gray-200 animate-pulse rounded"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
      </div>
    </CardContent>
  </Card>
)

// Error display component
const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <Card className="bg-red-50">
    <CardContent className="pt-6">
      <div className="text-center space-y-4">
        <p className="text-red-600 font-medium">Error loading assignment:</p>
        <p className="text-sm text-red-500">{error.message}</p>
        <Button onClick={onRetry} variant="outline" className="mt-2">
          Try Again
        </Button>
      </div>
    </CardContent>
  </Card>
)


// Assignment edit form component
const AssignmentEditForm = ({
  assignment,
  onSubmit,
  onCancel,
  isSubmitting,
  validationError
}: {
  assignment: IAssignment;
  onSubmit: (data: Partial<IAssignment>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  validationError: string | null;
}) => {
  const [formData, setFormData] = useState({
    title: assignment.title,
    description: assignment.description,
    dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
    lateDueDate: new Date(assignment.lateDueDate).toISOString().slice(0, 16)
  })

  const handleSubmit = () => {
    const dueDate = new Date(formData.dueDate)
    const lateDueDate = new Date(formData.lateDueDate)

    onSubmit({
      ...formData,
      dueDate,
      lateDueDate
    })
  }

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="edit-title">Title</Label>
        <Input
          id="edit-title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          disabled={isSubmitting}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <Input
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          disabled={isSubmitting}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-due-date">Due Date</Label>
        <Input
          id="edit-due-date"
          type="datetime-local"
          value={formData.dueDate}
          onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
          disabled={isSubmitting}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-late-due-date">Late Due Date</Label>
        <Input
          id="edit-late-due-date"
          type="datetime-local"
          value={formData.lateDueDate}
          onChange={(e) => setFormData(prev => ({ ...prev, lateDueDate: e.target.value }))}
          disabled={isSubmitting}
        />
      </div>
      {validationError && (
        <p className="text-sm text-red-500">{validationError}</p>
      )}
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

// Status badge component
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

const StatusSwitch = ({ 
  isEnabled, 
  onToggle, 
  disabled,
  disabledMessage,
  offLabel,
  onLabel
}: { 
  isEnabled: boolean; 
  onToggle: () => void;
  disabled: boolean;
  disabledMessage?: string;
  offLabel: string;
  onLabel: string;
}) => {

  const switchElement = (
    <div className="flex items-center space-x-2 my-2">
      <Switch
        checked={isEnabled}
        onCheckedChange={onToggle}
        disabled={disabled}
        aria-label="Toggle assignment publish status"
      />
      <Label className="text-sm text-muted-foreground">
        {isEnabled ? onLabel : offLabel}
      </Label>
    </div>
  )

  if (disabled) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-not-allowed">
                {switchElement}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{disabledMessage || "Unable to toggle in current state."}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

  return switchElement
}
  


// Main component
export function AssignmentDetails({ assignmentId }: { assignmentId: string }) {
  const { toast } = useToast()
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPublishedStatusDialogOpen, setIsPublishedStatusDialogOpen] = useState(false)
  const [isGradesReleasedStatusDialogOpen, setIsGradesReleasedStatusDialogOpen] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // React Query hooks
  const { data: assignment, isLoading, error } = useGetAssignmentById(assignmentId)
  const { mutate: updateAssignment, isPending: isUpdatingAssignment } = useUpdateAssignment()

  if (isLoading) {
    return <AssignmentDetailsSkeleton />
  }

  if (error || !assignment) {
    toast({
      title: "Uh oh. something went wrong finding this assignment",
      variant: "destructive"
    })
    router.back()
    return <div>Something went wrong</div>
  }

  const validateDates = (dueDate: Date, lateDueDate: Date): boolean => {
    if (lateDueDate < dueDate) {
      setValidationError("Late due date cannot be before the due date.")
      toast({
        title: "Validation Error",
        description: "Late due date cannot be before the due date.",
        variant: "destructive",
      })
      return false
    }
    setValidationError(null)
    return true
  }

  const handleUpdateAssignment = (updateData: Partial<IAssignment>) => {
    if ('dueDate' in updateData && 'lateDueDate' in updateData) {
      const isValid = validateDates(
        updateData.dueDate as Date,
        updateData.lateDueDate as Date
      )
      if (!isValid) return
    }

    updateAssignment(
      { assignmentId, updateData },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false)
          toast({
            title: "Success",
            description: "Assignment updated successfully",
          })
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          })
        }
      }
    )
  }

  const handleStatusChange = () => {
    updateAssignment(
      {
        assignmentId,
        updateData: { isPublished: !assignment.isPublished }
      },
      {
        onSuccess: () => {
          setIsPublishedStatusDialogOpen(false)
          toast({
            title: "Success",
            description: `Assignment ${assignment.isPublished ? "unpublished" : "published"} successfully`,
          })
        }
      }
    )
  }

  const handleReleaseGradesChange = () => {
    updateAssignment(
      {
        assignmentId,
        updateData: { areGradesReleased: !assignment.areGradesReleased }
      },
      {
        onSuccess: () => {
          setIsGradesReleasedStatusDialogOpen(false)
          toast({
            title: "Success",
            description: `Assignment ${assignment.areGradesReleased ? "released" : "hid"} grades successfully`,
          })
        }
      }
    )
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
        <CardTitle>{assignment.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div>
            <p>{assignment.description}</p>
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
              <AssignmentEditForm
                assignment={assignment}
                onSubmit={handleUpdateAssignment}
                onCancel={() => setIsEditDialogOpen(false)}
                isSubmitting={isUpdatingAssignment}
                validationError={validationError}
              />
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
                {formatDate(assignment.lateDueDate)}
              </p>
            </div>
          </div>
          {/* <div>
            <p className="font-semibold">Status:</p>
            <div 
              onClick={() => !isUpdatingAssignment && setIsStatusDialogOpen(true)} 
              className={`cursor-pointer ${isUpdatingAssignment ? 'opacity-50' : ''}`}
            >
              <StatusBadge isPublished={assignment.isPublished} />
            </div>
          </div> */}
          <div className="flex-col justify-between">
            <StatusSwitch 
              isEnabled={assignment.isPublished} 
              onToggle={() => !isUpdatingAssignment && setIsPublishedStatusDialogOpen(true)}
              disabled={false}
              offLabel={"Assignment Not Published"}
              onLabel={"Assignment Published"}
            />
            <StatusSwitch 
              isEnabled={assignment.areGradesReleased} 
              onToggle={() => !isUpdatingAssignment && setIsGradesReleasedStatusDialogOpen(true)}
              disabled={!assignment.isPublished}
              disabledMessage='Must publish assignment before you can publish grades'
              offLabel={"Grades Not Released"}
              onLabel={"Grades Released"}
            />
          </div>
            
            

          <div>
            <p className="font-semibold">Problems:</p>
            <p className="text-sm text-muted-foreground">{assignment.problems.length}</p>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={isPublishedStatusDialogOpen} onOpenChange={setIsPublishedStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {`${assignment.isPublished ? "Un-publish" : "Publish"} this assignment?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Students will {assignment.isPublished ? "no longer" : "now"} be able to see this assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingAssignment}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleStatusChange}
              disabled={isUpdatingAssignment}
            >
              {isUpdatingAssignment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isGradesReleasedStatusDialogOpen} onOpenChange={setIsGradesReleasedStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {`${assignment.areGradesReleased ? "Hide grades" : "Release grades"} for this assignment?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Students will {assignment.areGradesReleased ? "no longer" : "now"} be able to see the rubric for all problems in this assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingAssignment}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReleaseGradesChange}
              disabled={isUpdatingAssignment}
            >
              {isUpdatingAssignment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}