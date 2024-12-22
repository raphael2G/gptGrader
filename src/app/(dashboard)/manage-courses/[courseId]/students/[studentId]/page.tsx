'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BackButton } from '@/components/various/BackButton'
import { courseApi } from '@/app/lib/client-api/courses'
import { userApi } from '@/app/lib/client-api/users'
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { submissionApi } from '@/app/lib/client-api/submissions'
import { IUser } from '@@/models/User'
import { ICourse } from '@@/models/Course'
import { IAssignment, IProblem } from '@@/models/Assignment'
import { ISubmission } from '@@/models/Submission'
import { useToast } from "@/components/ui/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'

export default function StudentPerformancePage({ params }: { params: { courseId: string, studentId: string } }) {
  const [student, setStudent] = useState<IUser | null>(null)
  const [course, setCourse] = useState<ICourse | null>(null)
  const [assignments, setAssignments] = useState<IAssignment[]>([])
  const [submissions, setSubmissions] = useState<ISubmission[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [studentResponse, courseResponse, assignmentsResponse, submissionsResponse] = await Promise.all([
          userApi.getUserById(params.studentId),
          courseApi.getCourseById(params.courseId),
          assignmentApi.getAssignmentsByCourseId(params.courseId),
          submissionApi.getSubmissionsByStudentAndCourse(params.studentId, params.courseId)
        ])

        if (studentResponse.data && courseResponse.data && assignmentsResponse.data && submissionsResponse.data) {
          setStudent(studentResponse.data)
          setCourse(courseResponse.data)
          setAssignments(assignmentsResponse.data)
          setSubmissions(submissionsResponse.data)
        } else {
          throw new Error('Failed to fetch data')
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          variant: "destructive",
        })
        router.push(`/manage-courses/${params.courseId}/students`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.courseId, params.studentId, router, toast])

  if (loading) {
    return <div>Loading student data...</div>
  }

  if (!student || !course) {
    return <div>Student or course not found.</div>
  }
  
  const calculateEarnedPoints = (problem: IProblem, submission: ISubmission | undefined): number => {
    if (!submission) return 0;
    return problem.rubric
      .filter(item => submission.appliedRubricItemIds.includes(item.id))
      .reduce((sum, item) => sum + item.points, 0);
  }

  const graphData = assignments.map((assignment, index) => {
    const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignment._id);
    const score = assignment.problems.reduce((sum, problem) => {
      const problemSubmission = assignmentSubmissions.find(s => s.problemId === problem.id);
      return sum + calculateEarnedPoints(problem, problemSubmission);
    }, 0);
    const totalPoints = assignment.problems.reduce((sum, problem) => sum + problem.maxPoints, 0);
    return {
      name: `A${index + 1}`,
      fullName: assignment.title,
      score: score,
      totalPoints: totalPoints,
      percentage: totalPoints > 0 ? (score / totalPoints) * 100 : 0
    };
  });

  return (
    <div className="space-y-6">
      <BackButton />
      <div>
        <h1 className="text-3xl font-bold">{student.name}'s Performance Dashboard</h1>
        <h2 className="text-xl text-muted-foreground">Course: {course.title}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Student: {student.name} | Email: {student.email}
        </p>
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
                {assignments.map((assignment) => {
                  const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignment._id);
                  const score = assignment.problems.reduce((sum, problem) => {
                    const problemSubmission = assignmentSubmissions.find(s => s.problemId === problem.id);
                    return sum + calculateEarnedPoints(problem, problemSubmission);
                  }, 0);
                  const totalPoints = assignment.problems.reduce((sum, problem) => sum + problem.maxPoints, 0);
                  return (
                    <TableRow key={assignment._id}>
                      <TableCell className="font-medium truncate max-w-[200px]" title={assignment.title}>
                        <Link href={`/manage-courses/${params.courseId}/students/${params.studentId}/assignments/${assignment._id}`} className="text-blue-600 hover:underline">
                          {assignment.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">{score.toFixed(1)} / {totalPoints}</TableCell>
                    </TableRow>
                  );
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
                  <YAxis label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value, name, props) => [`${Number(value).toFixed(2)}%`, 'Score']}
                    labelFormatter={(label, payload) => {
                      if (!payload || payload.length === 0) return '';
                      return `${payload[0].payload.fullName}`;
                    }}                  
                  />
                  <Line type="monotone" dataKey="percentage" stroke="#8884d8" name="Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

