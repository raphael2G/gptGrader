import { getAssignmentsByCourseId } from '../fakeDatabase/assignments'
import { getSubmissionsByStudentAndCourse } from '../fakeDatabase/submissions'
import { IAssignment } from '@/models/Assignment'
import { ISubmission } from '@/models/Submission'

export interface StudentCourseStats {
  completionRate: number;
  pointsEarnedRate: number;
}

export async function getStudentCourseStats(courseId: string, studentId: string): Promise<StudentCourseStats> {
  const assignments: IAssignment[] = getAssignmentsByCourseId(courseId);
  const submissions: ISubmission[] = getSubmissionsByStudentAndCourse(studentId, courseId);

  const totalAssignments = assignments.length;
  const submittedAssignments = new Set(submissions.map(s => s.assignmentId)).size;

  const totalPossiblePoints = assignments.reduce((sum, assignment) => 
    sum + assignment.problems.reduce((problemSum, problem) => problemSum + problem.maxPoints, 0), 0);

  const earnedPoints = submissions.reduce((sum, submission) => {
    const assignment = assignments.find(a => a._id === submission.assignmentId);
    if (!assignment) return sum;
    const problem = assignment.problems.find(p => p.id === submission.problemId);
    if (!problem) return sum;
    const earnedPointsForProblem = problem.rubric
      .filter(item => submission.appliedRubricItemIds.includes(item.id))
      .reduce((itemSum, item) => itemSum + item.points, 0);
    return sum + earnedPointsForProblem;
  }, 0);

  const completionRate = totalAssignments > 0 ? submittedAssignments / totalAssignments : 0;
  const pointsEarnedRate = totalPossiblePoints > 0 ? earnedPoints / totalPossiblePoints : 0;

  return {
    completionRate,
    pointsEarnedRate
  };
}

