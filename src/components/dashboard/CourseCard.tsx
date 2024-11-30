import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

interface CourseCardProps {
  id: string
  title: string
  description: string
  assignmentCount: number
}

export function CourseCard({ id, title, description, assignmentCount }: CourseCardProps) {
  return (
    <Link href={`/courses/${id}`} className="block">
      <Card className="h-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <div className="flex items-center text-sm">
            <BookOpen className="mr-2 h-4 w-4" />
            {assignmentCount} {assignmentCount === 1 ? 'Assignment' : 'Assignments'}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

