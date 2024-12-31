'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BookOpen } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { useToast } from '@/components/ui/use-toast'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { ICourse } from '@/models/Course'

import { useInstructingCourses } from '@/hooks/queries/useUsers'
import { useCreateCourse } from "@/hooks/queries/useCourses"
import { UserAuth } from '@/contexts/AuthContext'


function InstructorCourseCard({ course }: { course: ICourse }) {
return (
  <Link href={`/manage-courses/${course._id}`} className="block">
    <Card className="h-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <CardHeader>
        <CardTitle className="text-lg">{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-between"> {/* Added flex-col and justify-between */}
        <div> {/* Wrapped description and course code in a div */}
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{course.description}</p>
          <p className="text-sm font-medium mb-4">Course Code: {course.courseCode}</p>
        </div>
        <div className="flex items-center justify-between"> {/* Added flex and justify-between */}
          <div className="flex items-center text-sm"> {/* Use BookOpen icon for assignments */}
            <BookOpen className="mr-2 h-4 w-4" /> {course.assignments.length} Assignments
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
)
}

export default function ManageCoursesPage() {
  // standard stuff
  const user = UserAuth().user
  const { toast } = useToast()
  const router = useRouter()

  // hooks
  const {data: courses = [], isLoading, error} = useInstructingCourses(user?._id?.toString() || '', {enabled: !!user?._id?.toString()});
  const {mutate: createCourse, isPending: creatingCourse, error: errorCreatingCourse} = useCreateCourse();


  // States
  const [newCourse, setNewCourse] = useState({ title: '', courseCode: '', description: '', instructor: '' })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // hook wrappers
  const handleCreateCourse = async () => {
    if (newCourse.title && newCourse.courseCode) {
      createCourse(
        {courseData: newCourse, creatorId: user?._id.toString() || ''},
        {
          onSuccess: () => {
            setNewCourse({ title: '', courseCode: '', description: '', instructor: '' })
            setIsAddDialogOpen(false)
            toast({
              title: "Success",
              description: "Course added successfully.",
              variant: "success"
            })
          },

          onError: (error) => {
            toast({
              title: "Error",
              description: error.message || "Failed to add course. Please try again.",
              variant: "destructive",
            })
          }
        }
      )
    }
  }

  // component specific functions
  // - - NONE - - 

  // loading & error states
  if (isLoading) {return <div>Loading...</div>}
  if (errorCreatingCourse) {
    toast({
      title: "Something went wrong loading this course.",
      description: errorCreatingCourse?.message || "Please try again later",
      variant: "destructive"
    })
    router.push("/manage-courses")
    return <div>There was an issue getting your course. {errorCreatingCourse?.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Courses</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Course</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
              <DialogDescription>Enter the details for the new course.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="course-title">Course Title</Label>
                <Input
                  id="course-title"
                  placeholder="e.g., Introduction to Computer Science"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-code">Course Code</Label>
                <Input
                  id="course-code"
                  placeholder="e.g., CS101"
                  value={newCourse.courseCode}
                  onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-description">Course Description</Label>
                <Input
                  id="course-description"
                  placeholder="Brief description of the course"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor-name">Instructor Name</Label>
                <Input
                  id="instructor-name"
                  placeholder="e.g., Dr. John Doe"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleCreateCourse} disabled={creatingCourse}>{creatingCourse ? "Creating Coure..." : "Add Course"}</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <InstructorCourseCard
            key={course._id?.toString() || course.title}
            course={course}
          />
        ))}
      </div>


    </div>
  )
}

