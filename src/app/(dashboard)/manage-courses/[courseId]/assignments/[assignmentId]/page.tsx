'use client'

import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/various/BackButton'
import { useToast } from "@/components/ui/use-toast"
import { AssignmentDetails } from '@/components/dashboard/manageCourses/AssignmentDetails'
import { ProblemList } from '@/components/dashboard/manageCourses/ProblemList'

import { useGetAssignmentById } from '@/hooks/queries/useAssignments'

export default function AssignmentDetailsPage({ params }: { params: { courseId: string, assignmentId: string } }) {
  
  const router = useRouter()
  const { toast } = useToast()

  const {data: assignment, isLoading: isGettingAssignment, error: errorGettingAssignment} = useGetAssignmentById(params.assignmentId)


  if (isGettingAssignment) return <div>Fetching the assignment...</div>
  if (errorGettingAssignment) {
    toast({
      title: "Something went wrong getting this assignment.",
      description: errorGettingAssignment?.message || "Please try again later",
      variant: "destructive"
    })
    router.push("/manage-courses/{params.courseId}/assignments")
    return <div>There was an issue getting your course. {errorGettingAssignment?.message}</div>;
  }

  if (!assignment) {
    router.push("/manage-courses/{params.courseId}/assignments")
    return <div>Assignment not found</div>
  }

  return (
    <div className="space-y-6">
      <BackButton backLink={`/manage-courses/${params.courseId}/assignments`}/>
      <h1 className="text-3xl font-bold">Assignment Details: {assignment.title}</h1>
      <AssignmentDetails assignmentId={assignment._id.toString()}/>
      <ProblemList assignmentId={assignment._id.toString()}/>
    </div>
  )
}