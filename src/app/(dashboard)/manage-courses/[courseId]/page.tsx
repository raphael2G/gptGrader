'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BackButton } from '@/components/various/BackButton'
import { courseApi } from '@/app/lib/client-api/courses'
import { ICourse } from '@/app/models/Course'
import Link from 'next/link'
import { BookOpen, Users, GraduationCap, FileWarning } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

export default function CourseManagementPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<ICourse | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true)
      try {
        const response = await courseApi.getCourseById(params.courseId)
        if (response.data) {
          setCourse(response.data)
        } else {
          throw new Error(response.error?.error || 'Failed to fetch course')
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch course details. Redirecting to manage courses page.",
          variant: "destructive",
        })
        router.push('/manage-courses')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [params.courseId, router, toast])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!course) {
    return <div>Course not found</div>
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">Manage Course: {course.title}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Course ID:</strong> {course._id}</p>
          <p><strong>Title:</strong> {course.title}</p>
          <p><strong>Description:</strong> {course.description}</p>
          <p><strong>Instructor:</strong> {course.instructor}</p>
          <p><strong>Course Code:</strong> {course.courseCode}</p>
          <p><strong>Semester:</strong> {course.semester}</p>
          <p><strong>Year:</strong> {course.year}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <Link href={`/manage-courses/${course._id}/assignments`} className="block">
          <Card className="h-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center h-full py-6">
              <BookOpen className="h-12 w-12 mb-4" />
              <CardTitle>Assignments</CardTitle>
              <p className="text-center mt-2">Manage course assignments</p>
              <p className="text-center mt-2 font-bold">Total: {course.assignments.length}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/manage-courses/${course._id}/students`} className="block">
          <Card className="h-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center h-full py-6">
              <Users className="h-12 w-12 mb-4" />
              <CardTitle>Students</CardTitle>
              <p className="text-center mt-2">Manage enrolled students</p>
              <p className="text-center mt-2 font-bold">Total: {course.students.length}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/manage-courses/${course._id}/grading`} className="block">
          <Card className="h-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center h-full py-6">
              <GraduationCap className="h-12 w-12 mb-4" />
              <CardTitle>Grading</CardTitle>
              <p className="text-center mt-2">Manage assignment grading</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/manage-courses/${course._id}/discrepancy-reports`} className="block">
          <Card className="h-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center h-full py-6">
              <FileWarning className="h-12 w-12 mb-4" />
              <CardTitle>Discrepancy Reports</CardTitle>
              <p className="text-center mt-2">Manage discrepancy reports</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

