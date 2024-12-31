'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BackButton } from '@/components/various/BackButton'
import { useToast } from "@/components/ui/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGetCourseById } from '@/hooks/queries/useCourses'
import { useGetSubmissionsByStudentId } from '@/hooks/queries/useSubmissions'
import { useGetAssignmentsByArrayOfIds } from '@/hooks/queries/useAssignments'
import { IProblem } from '@/models/Assignment'
import { ISubmission } from '@/models/Submission'
import { Loader2 } from "lucide-react"

export default function StudentPerformancePage({ params }: { params: { courseId: string, studentId: string } }) {
  const router = useRouter()
  const { toast } = useToast()

  // Fetch course data
  const { 
    data: course, 
    isLoading: courseLoading,
    error: courseError
  } = useGetCourseById(params.courseId)

  // Fetch all student's submissions
  const {
    data: submissions = [],
    isLoading: submissionsLoading,
    error: submissionsError
  } = useGetSubmissionsByStudentId(params.studentId)

  // Filter submissions for this course
  const courseSubmissions = submissions.filter(
    sub => sub.assignmentId.toString() === params.courseId
  )

  // Instead of getting assignments from submissions, we should get them from the course
  const assignmentIds = course?.assignments?.map(id => id.toString()) || []
  
  // Fetch all assignments for the course
  const {
    assignments = [],
    isLoading: assignmentsLoading,
    error: assignmentsError,
    isError: isAssignmentsError
  } = useGetAssignmentsByArrayOfIds(assignmentIds)

  // Handle loading state
  const isLoading = courseLoading || submissionsLoading || assignmentsLoading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Handle errors
  if (courseError || submissionsError || isAssignmentsError) {
    toast({
      title: "Error loading data",
      description: "Please try again later",
      variant: "destructive"
    })
    router.push(`/manage-courses/${params.courseId}/students`)
    return null
  }

  // Ensure we have course data
  if (!course) {
    router.push(`/manage-courses/${params.courseId}/students`)
    return null
  }

  const calculateEarnedPoints = (problem: IProblem, submission: ISubmission | undefined): number => {
    if (!submission) return 0
    return problem.rubric.items
      .filter(item => submission.appliedRubricItems?.includes(item._id))
      .reduce((sum, item) => sum + item.points, 0)
  }

  const graphData = assignments
  .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
  .map((assignment, index) => {
      // Find all submissions for this assignment
      const assignmentSubmissions = submissions.filter(
        s => s.assignmentId.toString() === assignment._id.toString()
      )
      
      // Calculate total points possible for the assignment
      const totalPoints = assignment.problems.reduce(
        (sum, problem) => sum + problem.maxPoints, 
        0
      )
      
      // Calculate earned points (0 if no submission)
      const score = assignment.problems.reduce((sum, problem) => {
        const problemSubmission = assignmentSubmissions.find(
          s => s.problemId.toString() === problem._id?.toString()
        )
        return sum + calculateEarnedPoints(problem, problemSubmission)
      }, 0)
      
      return {
        name: `A${index + 1}`,
        fullName: assignment.title,
        score: score,
        totalPoints: totalPoints,
        percentage: totalPoints > 0 ? (score / totalPoints) * 100 : 0,
        hasSubmission: assignmentSubmissions.length > 0
      }
  })

  return (
    <div className="space-y-6">
      <BackButton />
      <div>
        <h1 className="text-3xl font-bold">Student Performance Dashboard</h1>
        <h2 className="text-xl text-muted-foreground">Course: {course.title}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Assignment</TableHead>
                  <TableHead className="text-right w-[100px]">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments
                  .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                  .map((assignment) => {
                    const assignmentSubmissions = submissions.filter(
                      s => s.assignmentId.toString() === assignment._id.toString()
                    )
                    
                    const hasSubmission = assignmentSubmissions.length > 0
                    
                    const score = assignment.problems.reduce((sum, problem) => {
                      const problemSubmission = assignmentSubmissions.find(
                        s => s.problemId.toString() === problem._id?.toString()
                      )
                      return sum + calculateEarnedPoints(problem, problemSubmission)
                    }, 0)
                    
                    const totalPoints = assignment.problems.reduce(
                      (sum, problem) => sum + problem.maxPoints, 0
                    )

                    return (
                      <TableRow key={assignment._id.toString()}>
                        <TableCell className="font-medium truncate max-w-[200px]" title={assignment.title}>
                          <Link 
                            href={`/manage-courses/${params.courseId}/students/${params.studentId}/assignments/${assignment._id}`} 
                            className="text-blue-600 hover:underline"
                          >
                            {assignment.title}
                          </Link>
                          {!hasSubmission && (
                            <span className="ml-2 text-xs text-red-500">
                              (Not Submitted)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <span className={!hasSubmission ? "text-red-500" : ""}>
                            {score.toFixed(1)} / {totalPoints}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Graph</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    label={{ 
                      value: 'Score (%)', 
                      angle: -90, 
                      position: 'insideLeft' 
                    }} 
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${Number(value).toFixed(2)}%`, 
                      'Score'
                    ]}
                    labelFormatter={(label, payload) => {
                      if (!payload || payload.length === 0) return ''
                      return payload[0].payload.fullName
                    }}                  
                  />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="#8884d8" 
                    name="Score" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}