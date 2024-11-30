"use client";
import { CourseCard } from '@/components/dashboard/CourseCard'
import { courses } from '@/lib/dummy/courses'
import { UserAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { redirect } from 'next/navigation'

export default function Home() {
  // For this example, we'll assume the first three courses are the user's enrolled courses
  const enrolledCourses = courses.slice(0, 3)

  const {user} = UserAuth();

  useEffect(() => {
    if (!user) {
      redirect('/login')
    }
  }, [user])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to GPT Grader</h1>
      <p className="text-xl">Your enrolled courses:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enrolledCourses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            description={course.description}
            assignmentCount={course.assignments.length}
          />
        ))}
      </div>
    </div>
  )
}

