'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { discrepancyReportApi } from '@/app/lib/client-api/discrepancyReports'
import { Loader2 } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface DiscrepancyReport {
  studentId: string
  studentName: string
  studentGrade: number
  professorGrade: number
  finalGrade?: number
  status: 'pending' | 'resolved'
  submissionId: string
}

interface DiscrepancyReportsTableProps {
  courseId: string
  assignmentId: string
  problemId: string
}

export function DiscrepancyReportsTable({ 
  courseId,
  assignmentId,
  problemId 
}: DiscrepancyReportsTableProps) {
  const [reports, setReports] = useState<DiscrepancyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDiscrepancyReports = async () => {
      setLoading(true)
      try {
        console.log(`Fetching discrepancy reports for assignment ${assignmentId} and problem ${problemId}`);
        const response = await discrepancyReportApi.getDiscrepancyReportsByAssignment(assignmentId)
        if (response.data) {
          const problemFilteredReports = response.data.filter(report => report.problemId === problemId)
          const formattedReports: DiscrepancyReport[] = problemFilteredReports.map(report => ({
            studentId: report.studentId,
            studentName: report.studentName || 'Unknown Student',
            studentGrade: report.studentGrade || 0,
            professorGrade: report.professorGrade || 0,
            finalGrade: report.finalGrade,
            status: report.status,
            submissionId: report.submissionId
          }))
          setReports(formattedReports)
        } else {
          console.error('No data received from API:', response.error);
          throw new Error(response.error?.error || 'Failed to fetch discrepancy reports')
        }
      } catch (err) {
        console.error('Error in fetchDiscrepancyReports:', err);
        setError(`Failed to load discrepancy reports: ${err.message}`)
        toast({
          title: "Error",
          description: `Failed to load discrepancy reports: ${err.message}. Please try again.`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDiscrepancyReports()
  }, [assignmentId, problemId, toast])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Discrepancy Reports</h2>
        <Link 
          href={`/manage-courses/${courseId}/discrepancy-reports/${assignmentId}/${problemId}/${reports.find(report => report.status === 'pending')?.submissionId}`}
          passHref
        >
          <Button 
            disabled={!reports.some(report => report.status === 'pending')}
            className="bg-primary hover:bg-primary/90"
          >
            Start Resolving Disputes
          </Button>
        </Link>
      </div>
      
      {reports.length === 0 ? (
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
            {reports.map((report) => {
              const difference = report.finalGrade !== undefined 
                ? report.finalGrade - report.professorGrade 
                : undefined;
                
              return (
                <TableRow key={report.submissionId}>
                  <TableCell>
                    <Link 
                      href={`/manage-courses/${courseId}/discrepancy-reports/${assignmentId}/${problemId}/${report.submissionId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {report.studentId}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{report.studentGrade}</TableCell>
                  <TableCell className="text-right">{report.professorGrade}</TableCell>
                  <TableCell className="text-right">
                    {report.finalGrade ?? '-'}
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
                        report.status === 'resolved' 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                      )}
                    >
                      {report.status === 'resolved' ? 'Resolved' : 'Pending'}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

