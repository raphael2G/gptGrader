'use client';
import { useState } from 'react'
import { CourseCard } from '@/components/dashboard/CourseCard'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, X } from 'lucide-react'
import { courses } from '@/lib/dummy/courses'
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Home() {
  const [courseCode, setCourseCode] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // For this example, we'll assume the first three courses are the user's enrolled courses
  const enrolledCourses = courses.slice(0, 3)

  const handleJoinCourse = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically make an API call to join the course
    // For now, we'll just show a success message and close the dialog
    toast({
      title: "Course Joined",
      description: `You have successfully joined the course with code ${courseCode}.`,
    })
    setIsDialogOpen(false)
    setCourseCode('')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Join Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Join a Course</DialogTitle>
              <DialogDescription>
                Enter the course code provided by your instructor
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleJoinCourse} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="courseCode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Course Code
                </label>
                <Input
                  id="courseCode"
                  placeholder="Enter course code"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Join Course</Button>
            </form>
            {/* <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => setIsDialogOpen(false)}
            > */}
              {/* <X className="h-4 w-4" /> */}
            {/* </Button> */}
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Enrolled Courses</h2>
        {enrolledCourses && enrolledCourses.length > 0 ? (
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
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            You are not enrolled in any courses yet. Click the "Join Course" button to get started!
          </p>
        )}
      </div>
    </div>
  )
}


