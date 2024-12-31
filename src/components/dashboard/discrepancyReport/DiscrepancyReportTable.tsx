'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { Loader2 } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { useGetCourseById } from "@/hooks/queries/useCourses"
import { useGetUsersByArrayOfIds } from "@/hooks/queries/useUsers"
import { useGetDiscrepancyReportsByAssignmentId } from "@/hooks/queries/useDiscrepancyReports"
import { useGetAssignmentById } from "@/hooks/queries/useAssignments"
import { IUser } from "@/models/User"
import { IDiscrepancyReport, IDiscrepancyItem } from "@/models/DiscrepancyReport"
import { IProblem } from "@/models/Assignment"

interface DiscrepancyReportTableRow {
  studentId: string;
  student: IUser;
  report?: IDiscrepancyReport;
  studentGrade: number;
  professorGrade: number;
  finalGrade?: number;
  status: 'pending' | 'resolved' | 'none';
  submissionId?: string;
}

interface DiscrepancyReportsTableProps {
  courseId: string;
  assignmentId: string;
  problemId: string;
}

function calculateGrades(
  problem: IProblem,
  discrepancyItems: IDiscrepancyItem[]
): {
  studentGrade: number;
  professorGrade: number;
  finalGrade?: number;
} {
  // Create a map of rubric item IDs to their point values
  const rubricItemPoints = new Map<string, number>();
  problem.rubric.items.forEach(item => {
    rubricItemPoints.set(item._id?.toString() || '', item.points);
  });

  let studentGrade = 0;
  let professorGrade = 0;
  let finalGrade: number | undefined = undefined;
  let allResolved = true;

  discrepancyItems.forEach(item => {
    const points = rubricItemPoints.get(item.rubricItemId.toString()) || 0;

    // Professor's original grade
    if (item.wasOriginallyApplied) {
      professorGrade += points;
    }

    // Student's self-assessment
    if (item.studentThinksShouldBeApplied) {
      studentGrade += points;
    }

    // If resolved, contribute to final grade
    if (item.resolution) {
      if (item.resolution.shouldItemBeApplied) {
        if (finalGrade === undefined) finalGrade = 0;
        finalGrade += points;
      }
    } else {
      allResolved = false;
    }
  });

  return {
    studentGrade,
    professorGrade,
    finalGrade: allResolved ? finalGrade : undefined
  };
}

export function DiscrepancyReportsTable({ 
  courseId,
  assignmentId,
  problemId 
}: DiscrepancyReportsTableProps) {
  const { toast } = useToast()

  // Get the course to get the list of students
  const { 
    data: course,
    isLoading: courseLoading,
    error: courseError
  } = useGetCourseById(courseId);

  // Get the assignment to access the problem's rubric
  const { 
    data: assignment,
    isLoading: assignmentLoading,
    error: assignmentError
  } = useGetAssignmentById(assignmentId);

  // Get all discrepancy reports for this assignment
  const { 
    data: reports, 
    isLoading: reportsLoading, 
    error: reportsError 
  } = useGetDiscrepancyReportsByAssignmentId(assignmentId);

  // Get all students in the course
  const { 
    users: students, 
    isLoading: studentsLoading, 
    error: studentsError 
  } = useGetUsersByArrayOfIds(course?.students?.map(id => id.toString()) || [], {
    enabled: !!course
  });

  // Handle loading states
  if (courseLoading || assignmentLoading || reportsLoading || studentsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle errors
  if (courseError || assignmentError || reportsError || studentsError) {
    const error = courseError || assignmentError || reportsError || studentsError;
    toast({
      title: "Error",
      description: `Failed to load data: ${error?.message}`,
      variant: "destructive",
    });
    return <div className="text-center text-red-500">Error loading data</div>;
  }

  // Find the relevant problem
  const problem = assignment?.problems.find(p => p._id?.toString() === problemId);
  if (!problem) {
    toast({
      title: "Error",
      description: "Problem not found in assignment",
      variant: "destructive",
    });
    return <div className="text-center text-red-500">Problem not found</div>;
  }

  // Filter reports for this problem
  const problemReports = reports?.filter(report => report.problemId.toString() === problemId) || [];

  // Create a map of studentId to their report
  const studentReportMap = new Map<string, IDiscrepancyReport>();
  problemReports.forEach(report => {
    studentReportMap.set(report.studentId.toString(), report);
  });

  // Create table rows data for all students
  const tableRows: DiscrepancyReportTableRow[] = students?.map(student => {
    const studentId = student._id?.toString() || '';
    const report = studentReportMap.get(studentId);

    // If student has no report, return row with default values
    if (!report) {
      return {
        studentId,
        student,
        report: undefined,
        studentGrade: 0,
        professorGrade: 0,
        finalGrade: undefined,
        status: 'none'
      };
    }

    const grades = calculateGrades(problem, report.items);

    return {
      studentId,
      student,
      report,
      ...grades,
      status: report.status,
      submissionId: report.submissionId.toString()
    };
  }) || [];

  // Filter to only show students with reports
  const rowsWithReports = tableRows.filter(row => row.report);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Discrepancy Reports</h2>
        <Link 
          href={`/manage-courses/${courseId}/discrepancy-reports/${assignmentId}/${problemId}/${rowsWithReports.find(row => row.status === 'pending')?.submissionId}`}
          passHref
        >
          <Button 
            disabled={!rowsWithReports.some(row => row.status === 'pending')}
            className="bg-primary hover:bg-primary/90"
          >
            Start Resolving Disputes
          </Button>
        </Link>
      </div>
      
      {rowsWithReports.length === 0 ? (
        <p className="text-center text-gray-500">No discrepancy reports found for this problem.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead className="text-right">Student Grade</TableHead>
              <TableHead className="text-right">Professor Grade</TableHead>
              <TableHead className="text-right">Final Grade</TableHead>
              <TableHead className="text-right">Difference</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowsWithReports.map((row) => {
              const difference = row.finalGrade !== undefined 
                ? row.finalGrade - row.professorGrade 
                : undefined;
                
              return (
                <TableRow key={row.submissionId}>
                  <TableCell>
                    <Link 
                      href={`/manage-courses/${courseId}/discrepancy-reports/${assignmentId}/${problemId}/${row.submissionId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {row.student.name || row.student.email}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{row.studentGrade}</TableCell>
                  <TableCell className="text-right">{row.professorGrade}</TableCell>
                  <TableCell className="text-right">
                    {row.finalGrade ?? '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {difference !== undefined ? (
                      <span className={difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : ''}>
                        {difference > 0 ? '+' : ''}{difference}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        row.status === 'resolved' 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : row.status === 'pending'
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
                      )}
                    >
                      {row.status === 'resolved' ? 'Resolved' : row.status === 'pending' ? 'Pending' : 'No Report'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}