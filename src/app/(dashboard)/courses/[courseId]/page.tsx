'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { courseApi } from '@/app/lib/client-api/courses'
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { ICourse } from '@@/models/Course'
import { BackButton } from '@/components/various/BackButton'
import { AssignmentCard } from '@/components/dashboard/courses/AssignmentCard'
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'
import { IAssignment } from '@/app/models/Assignment'
import { EmptyState } from '@/components/various/EmptyState';

export default function CoursePage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<ICourse | null>(null)
  const [assignments, setAssignments] = useState<IAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const courseResponse = await courseApi.getCourseById(params.courseId);
        if (!courseResponse.data) {
          throw new Error(courseResponse.error?.error || 'Course not found');
        }
        setCourse(courseResponse.data);

        const assignmentsResponse = await assignmentApi.getAssignmentsByCourseId(params.courseId);
        if (assignmentsResponse.data) {
          setAssignments(assignmentsResponse.data);
        } else {
          throw new Error(assignmentsResponse?.error?.error || 'Failed to fetch assignments');
        }

      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [params.courseId, router, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">{error || 'Course not found'}</p>
        <BackButton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BackButton />
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
                  key={assignment._id}
                  courseId={course._id}
                  assignmentId={assignment._id}
                />
              ))}
          </div>
        ) : (
          <EmptyState message="Hey! This course doesn't have any assignments yet. Check back later!" />
        )}
      </div>
    </div>
  );
}