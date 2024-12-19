import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon } from 'lucide-react'
import Link from 'next/link'

interface AssignmentCardProps {
  courseId: string;
  id: string;
  title: string;
  dueDate: Date;
  status: 'unreleased' | 'released' | 'closed' | 'graded'; // Match the IAssignment status type
}

export function AssignmentCard({ courseId, id, title, dueDate, status }: AssignmentCardProps) {
  // Map database status to display colors
  const statusColors = {
    'unreleased': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'released': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'closed': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'graded': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }

  // Format the date to be more readable
  const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Helper function to get human-readable status
  const getDisplayStatus = (status: AssignmentCardProps['status']) => {
    const statusMap = {
      'unreleased': 'Not Released',
      'released': 'Open',
      'closed': 'Closed',
      'graded': 'Graded'
    };


    return status ? statusMap[status] : 'Not Released';
  }

  return (
    <Link href={`/courses/${courseId}/assignments/${id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Badge className={statusColors[status]}>
            {getDisplayStatus(status)}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="mr-1 h-3 w-3" />
            Due: {formattedDueDate}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}