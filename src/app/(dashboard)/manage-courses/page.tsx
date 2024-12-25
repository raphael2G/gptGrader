'use client'

import { useState, useEffect, ReactNode } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { courseApi } from '@@/lib/client-api/courses'
import { ICourse } from '@@/models/Course'
import { Pencil, Trash2, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useToast } from "@/components/ui/use-toast"


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
  const [courses, setCourses] = useState<ICourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newCourse, setNewCourse] = useState({ title: '', courseCode: '', description: '', instructor: '' })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<ICourse | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await courseApi.getInstructorCourses()
      if (response.data) {
        setCourses(response.data)
      } else {
        throw new Error(response.error?.error || 'Failed to fetch courses')
      }
    } catch (err) {
      setError('Failed to fetch courses')
      toast({
        title: "Error",
        description: "Failed to fetch courses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourse = async () => {
    if (newCourse.title && newCourse.courseCode) {
      try {
        const response = await courseApi.createCourse(newCourse, '69') // Using '69' as the instructor ID
        if (response.data) {
          setCourses([...courses, response.data])
          setNewCourse({ title: '', courseCode: '', description: '', instructor: '' })
          setIsAddDialogOpen(false)
          toast({
            title: "Success",
            description: "Course added successfully.",
          })
        } else {
          throw new Error(response.error?.error || 'Failed to add course')
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to add course. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpdateCourse = async () => {
    if (editingCourse) {
      try {
        const response = await courseApi.updateCourse(editingCourse._id, editingCourse)
        if (response.data) {
          setCourses(courses.map(course => course._id === editingCourse._id ? response.data : course))
          setEditingCourse(null)
          toast({
            title: "Success",
            description: "Course updated successfully.",
          })
        } else {
          throw new Error(response.error?.error || 'Failed to update course')
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to update course. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const response = await courseApi.deleteCourse(courseId)
      if (response.success) {
        setCourses(courses.filter(course => course._id !== courseId))
        toast({
          title: "Success",
          description: "Course deleted successfully.",
        })
      } else {
        throw new Error(response.error || 'Failed to delete course')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading courses...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
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
            <Button onClick={handleAddCourse}>Add Course</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <InstructorCourseCard
            key={course._id}
            course={course}
          />
        ))}
      </div>

      {editingCourse && (
        <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>Update the details for this course.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-course-title">Course Title</Label>
                <Input
                  id="edit-course-title"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-course-description">Course Description</Label>
                <Input
                  id="edit-course-description"
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-instructor-name">Instructor Name</Label>
                <Input
                  id="edit-instructor-name"
                  value={editingCourse.instructor}
                  onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleUpdateCourse}>Update Course</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

