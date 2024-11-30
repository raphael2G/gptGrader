'use client';
import { getCourse } from '@/lib/dummy/courses'
import { notFound } from 'next/navigation'
import { BackButton } from '@/components/dashboard/BackButton'
import { AssignmentCard } from '@/components/dashboard/AssignmentCard'
import { UserAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { redirect } from 'next/navigation'

export default function CoursePage({ params }: { params: { courseId: string } }) {
  const course = getCourse(params.courseId)

  if (!course) {
    notFound()
  }

  const {user} = UserAuth();

  useEffect(() => {
    if (!user) {
      redirect('/login')
    }
  }, [user])

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {course.assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              courseId={course.id}
              id={assignment.id}
              title={assignment.title}
              dueDate={assignment.dueDate}
              status={assignment.status}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

