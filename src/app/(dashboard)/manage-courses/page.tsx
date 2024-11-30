'use client'
import { useState } from 'react'
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
import { getInstructorCourses, addInstructorCourse, updateInstructorCourse, deleteInstructorCourse } from '@/lib/dummy/instructorCourses'
import { Course } from '@/lib/dummy/courses'
import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'

function InstructorCourseCard({ course, onEdit, onDelete }: { course: Course, onEdit: () => void, onDelete: () => void }) {
  return (
    <div>
      <Link href={`/manage-courses/${course.id}`} className="block">
        <Card className="h-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">{course.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
            <p className="text-sm">Instructor: {course.instructor}</p>
            <p className="text-sm">Assignments: {course.assignments.length}</p>
          </CardContent>
        </Card>
      </Link>
      <div className="mt-2 flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  )
}

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState<Course[]>(getInstructorCourses())
  const [newCourse, setNewCourse] = useState({ id: '', title: '', description: '', instructor: '' })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  const handleAddCourse = () => {
    if (newCourse.id && newCourse.title) {
      const courseToAdd = { ...newCourse, assignments: [] }
      addInstructorCourse(courseToAdd)
      setCourses(getInstructorCourses())
      setNewCourse({ id: '', title: '', description: '', instructor: '' })
      setIsAddDialogOpen(false)
    }
  }

  const handleUpdateCourse = () => {
    if (editingCourse) {
      updateInstructorCourse(editingCourse)
      setCourses(getInstructorCourses())
      setEditingCourse(null)
    }
  }

  const handleDeleteCourse = (courseId: string) => {
    deleteInstructorCourse(courseId)
    setCourses(getInstructorCourses())
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
                <Label htmlFor="course-id">Course ID</Label>
                <Input
                  id="course-id"
                  placeholder="e.g., CS101"
                  value={newCourse.id}
                  onChange={(e) => setNewCourse({ ...newCourse, id: e.target.value })}
                />
              </div>
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
            key={course.id}
            course={course}
            onEdit={() => setEditingCourse(course)}
            onDelete={() => handleDeleteCourse(course.id)}
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

