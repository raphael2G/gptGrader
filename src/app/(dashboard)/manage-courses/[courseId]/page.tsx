'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BackButton } from '@/components/dashboard/BackButton'
import { ICourse } from '@/models/Course'
import Link from 'next/link'
import { BookOpen, Users, GraduationCap } from 'lucide-react'
import { courseApi } from '@/api-client/endpoints/courses'

export default function CourseManagementPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<ICourse | null>(null)
  const router = useRouter()



  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data: foundCourse, error } = await courseApi.getCourseById(params.courseId);
  
        if (foundCourse) {
          setCourse(foundCourse);
        } else {
          console.error('Error fetching course:', error);
          router.push('/manage-courses');
        }
      } catch (err) {
        console.error('Unexpected error fetching course:', err);
        router.push('/manage-courses');
      }
    };
  
    fetchCourse();
  }, [params.courseId, router]);
  

  if (!course) {
    return <div>Loading...</div>
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
          <p><strong>Course ID:</strong> {course.courseCode}</p>
          <p><strong>Title:</strong> {course.title}</p>
          <p><strong>Description:</strong> {course.description}</p>
          <p><strong>Instructor:</strong> {course.instructor}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* <Link href={`/manage-courses/${course.id}/students`} className="block"> */}
          <Card onClick={() => alert("Sarah, trust assured this is en route!")} className="h-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center h-full py-6">
              <Users className="h-12 w-12 mb-4" />
              <CardTitle>Students</CardTitle>
              <p className="text-center mt-2">Manage enrolled students</p>
              <p className="text-center mt-2 font-bold">Coming soon</p>
            </CardContent>
          </Card>
        {/* </Link> */}

        {/* <Link href={`/manage-courses/${course.id}/grading`} className="block"> */}
          <Card onClick={() => alert("Sarah, trust assured this is en route!")} className="h-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center h-full py-6">
              <GraduationCap className="h-12 w-12 mb-4" />
              <CardTitle>Grading</CardTitle>
              <p className="text-center mt-2">Manage assignment grading</p>
              <p className="text-center mt-2 font-bold">Coming soon</p>
            </CardContent>
          </Card>
        {/* </Link> */}
      </div>
    </div>
  )
}

