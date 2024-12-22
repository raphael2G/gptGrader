import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { BackButton } from '@/components/various/BackButton'
import { courseApi } from '@/app/lib/client-api/courses'
import { StudentList } from '@/components/dashboard/students/StudentList'
import { StudentListSkeleton } from '@/components/dashboard/students/StudentListSkeleton'
import { ClassPerformanceVisualization } from '@/components/dashboard/students/ClassPerformanceVisualization'

export default async function StudentsPage({ params }: { params: { courseId: string } }) {
  const courseResponse = await courseApi.getCourseById(params.courseId)
  
  if (!courseResponse.data) {
    notFound()
  }

  const course = courseResponse.data

  return (
    <div className="space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">Students in {course.title}</h1>
      <Suspense fallback={<div>Loading class performance...</div>}>
        <ClassPerformanceVisualization courseId={course._id} />
      </Suspense>
      <Suspense fallback={<StudentListSkeleton />}>
        <StudentList courseId={course._id} />
      </Suspense>
    </div>
  )
}

