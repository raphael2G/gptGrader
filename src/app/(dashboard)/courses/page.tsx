'use client';
import { useEffect, useState } from 'react'
import { CourseCard } from '@/components/dashboard/CourseCard'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserAuth } from '@/contexts/AuthContext'
import { courseApi } from '@/api-client/endpoints/courses'
import { userApi } from '@/api-client/endpoints/users'
import { ICourse } from '@/models/Course'

export default function Home() {
  const [courseCode, setCourseCode] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [enrolledCourses, setEnrolledCourses] = useState<ICourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const { toast } = useToast()
  const { user, loading } = UserAuth()

  // Fetch enrolled courses on component mount and when user changes
  useEffect(() => {
    async function fetchCourses() {
      if (user?._id) {
        setIsLoading(true)
        const { data, error } = await userApi.getEnrolledCourses(user._id)
        console.log(data)
        
        if (error) {
          toast({
            title: "Error",
            description: error.error,
            variant: "destructive",
          })
        } else if (data) {
          setEnrolledCourses(data)
          console.log("just fetched these mfs")
          console.log(data)
        }
        setIsLoading(false)
      }
    }

    if (!loading) {
      fetchCourses()
    }
  }, [user?._id, loading, toast])

  const handleJoinCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?._id) {
      toast({
        title: "Error",
        description: "You must be logged in to join a course",
        variant: "destructive",
      })
      return
    }

    setIsJoining(true)
    try {
      const { data: newlyJoinedCourse, error } = await courseApi.joinCourseByCode(courseCode, user._id)
      
      if (error) {
        toast({
          title: "Error",
          description: error.error,
          variant: "destructive",
        })
        return
      }

      if (newlyJoinedCourse) {

        console.log("just joiened the new course")
        console.log(newlyJoinedCourse)

        // Add the new course to the list
        setEnrolledCourses(prev => [...prev, newlyJoinedCourse])
        
        toast({
          title: "Success",
          description: `You have successfully joined ${newlyJoinedCourse.title}`,
        })

        // Reset form and close dialog
        setIsDialogOpen(false)
        setCourseCode('')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  // Show loading state while checking auth or fetching courses
  if (loading || isLoading) {
    return <div className="flex justify-center items-center min-h-[200px]">Loading...</div>
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
              <Button 
                type="submit" 
                className="w-full"
                disabled={isJoining}
              >
                {isJoining ? 'Joining...' : 'Join Course'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Enrolled Courses</h2>
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((course) => (
              <CourseCard
                key={course._id?.toString()}
                id={course._id?.toString() || ''}
                title={course.title}
                description={course.description}
                assignmentCount={course.assignments?.length || 0}
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