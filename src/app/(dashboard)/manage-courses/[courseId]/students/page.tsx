'use client'

import { Suspense } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { BackButton } from '@/components/various/BackButton'
import { StudentList } from '@/components/dashboard/students/StudentList'
import { StudentListSkeleton } from '@/components/dashboard/students/StudentListSkeleton'
import { ClassPerformanceVisualization } from '@/components/dashboard/students/ClassPerformanceVisualization'
import { useGetCourseById } from '@/hooks/queries/useCourses'

export default function StudentsPage({ params }: { params: { courseId: string } }) {
  const router = useRouter()
  const { data: course, error, isLoading } = useGetCourseById(params.courseId)

  if (error || !course) {
    router.back()
    return null
  }

  return (
    <div className="space-y-6">
      <BackButton backLink={`/manage-courses/${params.courseId}`} />
      <h1 className="text-3xl font-bold">Students in {course.title}</h1>
      <Suspense fallback={<div>Loading class performance...</div>}>
        <ClassPerformanceVisualization courseId={course._id.toString()} />
      </Suspense>
      <Suspense fallback={<StudentListSkeleton />}>
        <StudentList courseId={course._id.toString()} />
      </Suspense>
    </div>
  )
}