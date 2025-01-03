'use client'

import { useRouter } from 'next/navigation'

import { BackButton } from '@/components/various/BackButton'
import { AssignmentCard } from '@/components/dashboard/courses/AssignmentCard'
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'

import { EmptyState } from '@/components/various/EmptyState';
import { useGetCourseById } from '@/hooks/queries/useCourses'
import { useGetAssignmentsByArrayOfIds } from "@/hooks/queries/useAssignments"

export default function CoursePage({ params }: { params: { courseId: string } }) {
  // const [course, setCourse] = useState<ICourse | null>(null)
  // const [assignments, setAssignments] = useState<IAssignment[]>([])
  // const [loading, setLoading] = useState(true)
  // const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const {data: course, isLoading: isLoadingCourse, error: fetchingCourseError} = useGetCourseById(params.courseId);
  const {
    assignments, 
    isLoading: isLoadingAssignments, 
    error: fetchingAssignmentsError
  } = useGetAssignmentsByArrayOfIds(course?.assignments.map(item => {return item.toString()}) || [], {enabled: !!course})


  if (isLoadingAssignments || isLoadingCourse) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (fetchingCourseError || !course) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">{fetchingCourseError?.message || 'There was an issue fetching your course...'}</p>
        <BackButton backLink='/courses'/>
      </div>
    )
  }

  if (fetchingAssignmentsError) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">{fetchingAssignmentsError?.message || 'There was an issue fetching your assignments...'}</p>
        <BackButton backLink='/courses'/>
      </div>
    )
  }



  return (
    <div className="space-y-6">
        <BackButton backLink='/courses'/>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-xl text-muted-foreground">{course.description}</p>
        <p className="text-lg">Instructor: {course.instructor}</p>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Assignments</h2>
        {assignments.filter((assignment) => assignment.isPublished).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments
              .filter((assignment) => assignment.isPublished) // Filter out unpublished assignments
              .map((assignment) => (
                <AssignmentCard
                  key={assignment._id.toString()}
                  courseId={course._id.toString()}
                  assignmentId={assignment._id.toString()}
                />
              ))}
          </div>
        ) : (
          <EmptyState message="Hey! This course doesn't have any assignments yet. Check back later!" />
        )}
      </div>
    </div>
  )
}

