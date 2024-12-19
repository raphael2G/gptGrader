'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { ICourse } from '@/models/Course'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { UserAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast"
import { courseApi } from '@/api-client/endpoints/courses'
import { userApi } from '@/api-client/endpoints/users'




function InstructorCourseCard({ course, onEdit, onDelete }: { 
  course: ICourse, 
  onEdit: () => void, 
  onDelete: () => void 
}) {
  return (
    <div>
      <Link href={`/manage-courses/${course._id}`} className="block">
        <Card className="h-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">{course.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{course.courseCode}</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
            <p className="text-sm">Instructor: {course.instructor}</p>
            <p className="text-sm">
              {course.semester} {course.year}
            </p>
          </CardContent>
        </Card>
      </Link>
      {/* <div className="mt-2 flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div> */}
    </div>
  )
}

interface CourseFormData {
  title: string;
  courseCode: string;
  description: string;
  instructor: string;
  semester?: string;
  year?: number;
}

const initialFormData: CourseFormData = {
  title: '',
  courseCode: '',
  description: '',
  instructor: '',
  semester: undefined,
  year: undefined,
}

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState<ICourse[]>([])
  const [newCourse, setNewCourse] = useState<CourseFormData>(initialFormData)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<ICourse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { user } = UserAuth()
  const { toast } = useToast()

  // Fetch courses on component mount
  useEffect(() => {
    const fetchInstructorCourses = async () => {
      if (!user?._id) return;
  
      try {
        const { data: instructingCourses, error } = await userApi.getInstructingCourses(user._id);
        console.log(instructingCourses)
        if (error) {
          console.error("Failed to fetch instructing courses:", error);
          return; 
        }
  
        setCourses(instructingCourses ?? []);
      } catch (err) {
        console.error("An unexpected error occurred:", err);
      }
    };
  
    fetchInstructorCourses();
  }, [user?._id]);



  const handleAddCourse = async () => {
    if (!user?._id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a course",
        variant: "destructive"
      })
      return
    }

    if (!newCourse.title || !newCourse.courseCode || !newCourse.description || !newCourse.instructor) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await courseApi.createCourse(newCourse, user._id)
      
      if (error) {
        throw new Error(error.error)
      }

      if (data) {
        setCourses(prev => [...prev, data])
        setNewCourse(initialFormData)
        setIsAddDialogOpen(false)
        toast({
          title: "Success",
          description: "Course created successfully",
          variant: 'success'
        })
        setIsLoading(false)
      }

    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create course",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateCourse = () => {
    // TODO: Implement course update API
    alert('Update not yet implemented');
  }
  
  const handleDeleteCourse = async (courseId: string) => {
    if (!courseId) return;
  
    try {
      const { data, error } = await courseApi.delete(courseId);
      
      if (error) {
        throw new Error(error.error);
      }

      if (data) {
        // Remove the course from the local state
        setCourses(prev => prev.filter(course => course._id?.toString() !== courseId));
      }
  

      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
  
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete course",
        variant: "destructive"
      });
    }
  };
  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Courses</h1>
        {/* <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
            <Button onClick={handleAddCourse} disabled={isLoading}>
              {isLoading ? "Creating..." : "Add Course"}
            </Button>
          </DialogContent>
        </Dialog> */}
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
                <Label htmlFor="course-code">Course Code</Label>
                <Input
                  id="course-code"
                  placeholder="e.g., CS101"
                  value={newCourse.courseCode}
                  onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
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
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select
                  value={newCourse.semester}
                  onValueChange={(value) => setNewCourse({ ...newCourse, semester: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="e.g., 2024"
                  value={newCourse.year || ''}
                  onChange={(e) => setNewCourse({ 
                    ...newCourse, 
                    year: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
              </div>
            </div>
            <Button onClick={handleAddCourse} disabled={isLoading}>
              {isLoading ? "Creating..." : "Add Course"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses?.map((course) => (
          <InstructorCourseCard
            key={course._id?.toString()} 
            course={course}
            onEdit={() => setEditingCourse(course)}
            onDelete={() => course._id && handleDeleteCourse(course._id.toString())}
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

