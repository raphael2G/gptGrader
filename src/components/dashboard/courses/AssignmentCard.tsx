import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { IAssignment } from '@/models/Assignment'
import { useGetAssignmentById } from '@/hooks/queries/useAssignments'

interface AssignmentCardProps {
  courseId: string;
  assignmentId: string;
}

export function AssignmentCard({ courseId, assignmentId }: AssignmentCardProps) {
  const {data: assignment, isLoading, error} = useGetAssignmentById(assignmentId);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">
            <Button variant="ghost" isLoading>
              Loading assignment...
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error || !assignment) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            Failed to load assignment
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const getAssignmentStatus = (assignment: IAssignment) => {
    if (!assignment.isPublished) return 'Unreleased';
    if (new Date() < assignment.dueDate) return 'Open';
    if (new Date() < assignment.lateDueDate) return 'Overdue';
    if (!assignment.areGradesReleased) return 'Closed';
    return 'Graded';
  };

  const status = getAssignmentStatus(assignment);

  const statusColors: Record<string, string> = {
    'Unreleased': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'Open': 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200',
    'Overdue': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200',
    'Closed': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200',
    'Graded': 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200'
  };

  return (
    <Link href={`/courses/${courseId}/assignments/${assignment._id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {assignment.title}
          </CardTitle>
          <Badge className={statusColors[status]}>
            {status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="mr-1 h-3 w-3" />
            Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}