'use client'

import { useState, useEffect } from 'react'
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { courseApi } from '@/app/lib/client-api/courses'
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { submissionApi } from '@/app/lib/client-api/submissions'
import { userApi } from '@/app/lib/client-api/users'

interface PerformanceData {
  name: string
  fullName: string
  score: number
  totalPoints: number
  percentage: number
  studentName: string
}

export function StudentPerformanceChart({ courseId }: { courseId: string }) {
  const [chartData, setChartData] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const studentsResponse = await courseApi.getStudentIdsInCourse(courseId)
        const assignmentsResponse = await assignmentApi.getAssignmentsByCourseId(courseId)
        
        if (!studentsResponse.data || !assignmentsResponse.data || studentsResponse.data.length === 0) {
          throw new Error('Failed to fetch students or assignments')
        }

        const studentId = studentsResponse.data[0] // Get the first student
        const assignments = assignmentsResponse.data

        const studentResponse = await userApi.getUserById(studentId)
        if (!studentResponse.data) {
          throw new Error('Failed to fetch student data')
        }
        const student = studentResponse.data

        const submissionsResponse = await submissionApi.getSubmissionsByStudentAndCourse(studentId, courseId)
        if (!submissionsResponse.data) {
          throw new Error('Failed to fetch submissions')
        }

        const submissions = submissionsResponse.data

        const performanceData: PerformanceData[] = assignments.map((assignment, index) => ({
          name: `A${index + 1}`,
          fullName: assignment.title,
          score: assignment.problems.reduce((sum, problem) => {
            const problemSubmission = submissions.filter(s => s.assignmentId === assignment._id).find(s => s.problemId === problem.id)
            if (!problemSubmission) return sum
            return sum + problem.rubric
              .filter(item => problemSubmission.appliedRubricItemIds.includes(item.id))
              .reduce((itemSum, item) => itemSum + item.points, 0)
          }, 0),
          totalPoints: assignment.problems.reduce((sum, problem) => sum + problem.maxPoints, 0),
          percentage: assignment.problems.reduce((sum, problem) => sum + problem.maxPoints, 0) > 0 ? (assignment.problems.reduce((sum, problem) => {
            const problemSubmission = submissions.filter(s => s.assignmentId === assignment._id).find(s => s.problemId === problem.id)
            if (!problemSubmission) return sum
            return sum + problem.rubric
              .filter(item => problemSubmission.appliedRubricItemIds.includes(item.id))
              .reduce((itemSum, item) => itemSum + item.points, 0)
          }, 0) / assignment.problems.reduce((sum, problem) => sum + problem.maxPoints, 0)) * 100 : 0,
          studentName: student.name
        }))

        setChartData(performanceData)
        setError(null)
      } catch (err) {
        setError('Failed to fetch performance data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId])

  if (loading) {
    return <div>Loading performance data...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
        <Tooltip 
        content={({ active, payload }) => {
          if (!active || !payload || payload.length === 0) return null;

          const data = payload[0].payload; // Access the data point
          return (
            <div className="bg-white p-2 border rounded shadow">
              <p className="font-bold">{data.fullName}</p>
              <p>{data.studentName}</p>
              <p>Score: {data.percentage.toFixed(2)}%</p>
            </div>
          );
        }}
      />
        <Scatter type="monotone" dataKey="percentage" stroke="#8884d8" name="Score" />
        <Scatter
          name="Score"
          data={chartData}
          dataKey="percentage"
          shape={(props) => (
            <circle
              cx={props.cx}
              cy={props.cy}
              r={3} // Radius of the circle
              stroke="#8884d8" // Purple stroke
              strokeWidth={2} // Width of the circle's border
              fill="white" // Makes the circle open
            />
          )}
        />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

{}
0

