import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { isAssignmentReleased } from '@/lib/dummy/courses'


interface AssignmentCardProps {
  courseId: string;
  id: string;
  title: string;
  dueDate: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

export function AssignmentCard({ courseId, id, title, dueDate, status }: AssignmentCardProps) {
  const statusColors = {
    'not-started': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }
  
  const isReleased = isAssignmentReleased(courseId, id)
  console.log("courseId: ", courseId, "id: ", id, "isReleased: ", isReleased)

  return (
    <Link href={`/courses/${courseId}/assignments/${id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {isReleased && (<div className="flex flex-col items-center justify-between gap-y-1">
            <Badge className={statusColors[status]}>{status}</Badge>
            <Badge className={statusColors[status]}>Released</Badge>
          </div>)}
          
          {!isReleased &&(<Badge className={statusColors[status]}>{status}</Badge>)}
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="mr-1 h-3 w-3" />
            Due: {dueDate}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

