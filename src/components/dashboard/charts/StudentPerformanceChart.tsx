import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Loader2 } from "lucide-react"
import { useGetCourseById } from '@/hooks/queries/useCourses'
import { useGetAssignmentsByArrayOfIds } from '@/hooks/queries/useAssignments'
import { useGetUserById } from '@/hooks/queries/useUsers'
import { useGetSubmissionsByStudentId } from '@/hooks/queries/useSubmissions'
import React from 'react'

interface PerformanceData {
  x: number
  y: number
  assignmentName: string
  fullName: string
  studentId: string
  studentName: string
}

// Function to generate distinct colors using HSL
function generateDistinctColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const hue = (i * 360 / count) % 360  // Spread hues evenly around the color wheel
    const saturation = 70  // Keep saturation constant for consistency
    const lightness = 45   // Keep lightness constant for visibility
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  })
}

export function StudentPerformanceChart({ courseId }: { courseId: string }) {
  const { data: course, isLoading: isCourseLoading, error: courseError } = useGetCourseById(courseId)

  const { assignments, isLoading: isAssignmentsLoading, error: assignmentsError } = 
    useGetAssignmentsByArrayOfIds(course?.assignments?.map(id => id.toString()) || [])

  const studentQueries = course?.students?.map(studentId => ({
    user: useGetUserById(studentId.toString()),
    submissions: useGetSubmissionsByStudentId(studentId.toString())
  })) || []

  const isStudentDataLoading = studentQueries.some(query => query.user.isLoading || query.submissions.isLoading)
  const studentDataError = studentQueries.find(query => query.user.error || query.submissions.error)?.user.error

  // Generate chart data grouped by student
  const studentDataSeries = React.useMemo(() => {
    if (!course?.students || !assignments || studentQueries.some(q => !q.user.data || !q.submissions.data)) {
      return []
    }

    const courseAssignmentIds = new Set(course.assignments.map(id => id.toString()))

    return course.students.map(studentId => {
      const studentQuery = studentQueries.find(q => 
        q.user.data?._id.toString() === studentId.toString()
      )
      
      if (!studentQuery) return null

      const { user: { data: userData }, submissions: { data: allSubmissions } } = studentQuery

      // Filter submissions to only include those from this course
      const courseSubmissions = allSubmissions?.filter(submission => 
        courseAssignmentIds.has(submission.assignmentId.toString())
      ) || []

      // Create data points for each assignment
      const dataPoints = assignments.map((assignment, index) => {
        const assignmentSubmissions = courseSubmissions.filter(sub => 
          sub.assignmentId.toString() === assignment._id.toString()
        )

        const pointsEarned = assignmentSubmissions.reduce((acc, submission) => {
          const problem = assignment.problems.find(p => 
            p._id?.toString() === submission.problemId.toString()
          )

          if (!problem || !submission.appliedRubricItems) return acc

          const earnedForSubmission = submission.appliedRubricItems.reduce((sum, itemId) => {
            const rubricItem = problem.rubric.items.find(item => 
              item._id?.toString() === itemId.toString()
            )
            return sum + (rubricItem?.points || 0)
          }, 0)

          return acc + earnedForSubmission
        }, 0)

        const totalPossiblePoints = assignment.problems.reduce(
          (sum, problem) => sum + problem.maxPoints, 
          0
        )

        return {
          x: index,
          y: totalPossiblePoints > 0 ? (pointsEarned / totalPossiblePoints) * 100 : Math.random() * 100, // to see differences with no data
          assignmentName: `A${index + 1}`,
          fullName: assignment.title,
          studentId: studentId.toString(),
          studentName: userData?.name || 'Unknown Student',
        }
      })

      return {
        studentId: studentId.toString(),
        studentName: userData?.name || 'Unknown Student',
        data: dataPoints
      }
    }).filter((series): series is NonNullable<typeof series> => series !== null)
  }, [course?.students, assignments, studentQueries])

  // Generate colors for each student
  const colors = generateDistinctColors(studentDataSeries.length)

  if (isCourseLoading || isAssignmentsLoading || isStudentDataLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (courseError || assignmentsError || studentDataError) {
    return (
      <div className="text-red-500 p-4">
        Error loading performance data: {(courseError || assignmentsError || studentDataError)?.message}
      </div>
    )
  }

  const xAxisCategories = assignments?.map((_, index) => `A${index + 1}`) || []

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number"
          dataKey="x"
          name="Assignment"
          tickFormatter={(value) => xAxisCategories[value]}
          domain={[0, xAxisCategories.length - 1]}
          ticks={Array.from({ length: xAxisCategories.length }, (_, i) => i)}
        />
        <YAxis 
          type="number"
          dataKey="y"
          name="Score"
          domain={[0, 100]}
          label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} 
        />
        <Tooltip 
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null;

            const data = payload[0].payload as PerformanceData;
            return (
              <div className="bg-white p-2 border rounded shadow">
                <p className="font-bold">{data.fullName}</p>
                <p>{data.studentName}</p>
                <p>Score: {data.y.toFixed(1)}%</p>
              </div>
            );
          }}
        />
        {/* <Legend /> */}
        {studentDataSeries.map((series, index) => (
          <Scatter
            key={series.studentId}
            name={series.studentName}
            data={series.data}
            fill={colors[index]}
            dataKey="y"
            shape={(props) => (
              <circle
                cx={props.cx}
                cy={props.cy}
                r={4}
                stroke={colors[index]}
                strokeWidth={2}
                fill="white"
                className="hover:r-6 transition-all"
              />
            )}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  )
}