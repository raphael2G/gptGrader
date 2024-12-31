'use client'

import { useState } from 'react'
import { CourseCard } from '@/components/dashboard/CourseCard'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, X } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

import { useEnrolledCourses } from '@/hooks/queries/useUsers'
import { useJoinCourseByCode } from '@/hooks/queries/useCourses'

export default function Home() {
  const user = UserAuth().user
  console.log("user: ", user)
  const { toast } = useToast()
  const router = useRouter()

  const [courseCode, setCourseCode] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: enrolledCourses = [], isLoading, error } = useEnrolledCourses(user?._id?.toString() || '', {enabled: !!user?._id });
  const { mutate: joinCourse, isPending: isJoining } = useJoinCourseByCode();

  if (isLoading) {return <div>Loading courses...</div>}
  if (error) {return <div>Uh oh. Something went wrong loading the course.</div>}

  const handleJoinCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    joinCourse(
      { courseCode, studentId: user?._id?.toString() },
      {
        onSuccess: (course) => {
          console.log("Will show toast now, but not fron toast")
          toast({
            title: "Course Joined",
            description: `You have successfully joined the course ${course.title}.`,
          });
          setIsDialogOpen(false);
          setCourseCode('');
        },
        onError: (error) => {
          console.log("Will show toast now, but not fron toast")

          toast({
            title: "Error",
            description: error.message || "Failed to join the course. Please try again.",
            variant: "destructive",
          });
        },
        onSettled: () => {
          
        },
      }
    );
  };


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
              {/* <Button disabled={isJoining} type="submit" className="w-full">{isJoining ? "Joining Course..." : "Join Course"}</Button> */}
              <Button 
                type="submit" 
                className="w-full"
                isLoading={isJoining}
                icon={PlusCircle}
              >
                Join Course
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Enrolled Courses</h2>
        {enrolledCourses && enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((course) => (
              <CourseCard
                key={course._id.toString()}
                id={course._id.toString()}
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

