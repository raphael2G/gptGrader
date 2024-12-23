import { IDiscrepancyReport, IDiscrepancyItem } from '@@/models/DiscrepancyReport';
import { simulateApiDelay } from '../utils/apiDelay';
import { IRubricItem } from '@@/models/Assignment'; // Import IRubricItem
import { submissionApi } from './submissions';
import { userApi } from './users';

interface ApiError {
  error: string;
  details?: string;
}

interface DiscrepancyReportApiResponse {
  data: IDiscrepancyReport | null;
  error?: ApiError;
}

type resolution = "student" | "instructor"

// Load discrepancy reports from localStorage or initialize an empty array
const loadDiscrepancyReports = (): IDiscrepancyReport[] => {
  if (typeof window !== 'undefined') {
    const storedReports = localStorage.getItem('discrepancyReports');
    return storedReports ? JSON.parse(storedReports) : [];
  }
  return [];
};

// Save discrepancy reports to localStorage
const saveDiscrepancyReports = (reports: IDiscrepancyReport[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('discrepancyReports', JSON.stringify(reports));
  }
};

let discrepancyReports: IDiscrepancyReport[] = loadDiscrepancyReports();

export const discrepancyReportApi = {
  createOrUpdateDiscrepancyReport: async (
    discrepancyItem: IDiscrepancyItem
  ): Promise<DiscrepancyReportApiResponse> => {
    await simulateApiDelay();
    try {

      const existingReportIndex = discrepancyReports.findIndex(report => 
        report.submissionId === discrepancyItem.submissionId &&
        report.studentId === discrepancyItem.studentId &&
        report.courseId === discrepancyItem.courseId &&
        report.assignmentId === discrepancyItem.assignmentId
      );
      if (existingReportIndex !== -1) {
        // Explicitly update the array at the found index
        discrepancyReports[existingReportIndex] = {
          ...discrepancyReports[existingReportIndex],
          items: [...discrepancyReports[existingReportIndex].items, discrepancyItem],
          updatedAt: new Date()
        };
        
        return {
          success: true,
          data: discrepancyReports[existingReportIndex]
        };
      } else {
        const newReport: IDiscrepancyReport = {
          _id: `report-${Date.now()}`,
          submissionId: discrepancyItem.submissionId,
          studentId: discrepancyItem.studentId,
          courseId: discrepancyItem.courseId,
          assignmentId: discrepancyItem.assignmentId,
          problemId: discrepancyItem.problemId,
          status: 'pending',
          items: [discrepancyItem],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        discrepancyReports.push(newReport);
        existingReport = newReport;
      }

      saveDiscrepancyReports(discrepancyReports);


      return { data: existingReport };
    } catch (err) {
      console.error('Error creating/updating discrepancy report:', err);
      return {
        data: null,
        error: { error: 'Failed to create or update discrepancy report' }
      };
    }
  },

  getDiscrepancyReportsBySubmission: async (submissionId: string): Promise<{ data: IDiscrepancyReport[] | null; error?: ApiError }> => {
    await simulateApiDelay();
    try {
      const reports = discrepancyReports.filter(report => report.submissionId === submissionId);
      return { data: reports };
    } catch (err) {
      console.error('Error fetching discrepancy reports by submission:', err);
      return {
        data: null,
        error: { error: 'Failed to fetch discrepancy reports for submission' }
      };
    }
  },

  getDiscrepancyReportsByAssignment: async (assignmentId: string): Promise<{ data: IDiscrepancyReport[] | null; error?: ApiError }> => {
    await simulateApiDelay();
    try {
      const reports = discrepancyReports.filter(report => report.assignmentId === assignmentId);
      return { data: reports };
    } catch (err) {
      console.error('Error fetching discrepancy reports by assignment:', err);
      return {
        data: null,
        error: { error: 'Failed to fetch discrepancy reports for assignment' }
      };
    }
  },

  getDiscrepancyReportsByProblem: async (assignmentId: string, problemId: string): Promise<{ data: IDiscrepancyReport[] | null; error?: ApiError }> => {
    await simulateApiDelay();
    try {
      console.log(`Fetching discrepancy reports for assignment ${assignmentId} and problem ${problemId}`);
      const reports = discrepancyReports.filter(report => 
        report.assignmentId === assignmentId && report.problemId === problemId
      );
      console.log(`Found ${reports.length} reports`);
  
      // Fetch additional data (student names, grades) that we need for the table
      const enhancedReports = await Promise.all(reports.map(async (report) => {
        console.log(`Processing report for submission ${report.submissionId}`);
        let submissionData = null;
        let studentData = null;

        try {
          const submission = await submissionApi.getSubmissionById(report.submissionId);
          submissionData = submission.data;
        } catch (submissionError) {
          console.error(`Failed to fetch submission data for ${report.submissionId}:`, submissionError);
        }

        try {
          const student = await userApi.getUserById(report.studentId);
          studentData = student.data;
        } catch (studentError) {
          console.error(`Failed to fetch student data for ${report.studentId}:`, studentError);
        }
        
        return {
          ...report,
          studentName: studentData?.name || 'Unknown Student',
          studentGrade: submissionData?.selfGrade || 0,
          professorGrade: submissionData?.appliedRubricItemIds?.length || 0,
          finalGrade: submissionData?.graded ? (submissionData?.appliedRubricItemIds?.length || 0) : undefined,
        };
      }));

      console.log(`Processed ${enhancedReports.length} enhanced reports`);
      return { data: enhancedReports };
    } catch (err) {
      console.error('Error fetching discrepancy reports by problem:', err);
      return {
        data: null,
        error: { error: 'Failed to fetch discrepancy reports for problem', details: err.message }
      };
    }
  },
  getDiscrepancyReportStatsByRubricItem: async (assignmentId: string, problemId: string, problemRubric: IRubricItem[]): Promise<Record<string, number>> => {
    await simulateApiDelay();

    // Fetch discrepancy reports related to the given assignment and problem
    const assignmentReports = discrepancyReports.filter(report => report.assignmentId === assignmentId && report.problemId === problemId);

    const stats: Record<string, number> = {};

    problemRubric.forEach(rubricItem => {
      const count = assignmentReports.filter(report => report.items.some(item => item.rubricItemId === rubricItem.id)).length;
      stats[rubricItem.id] = count;
    });

    return stats;
  },
  resolveDiscrepancyReport: async (
    submissionId: string,
    rubricItemId: string,
    resolutionData: { resolution: 'student' | 'instructor'; explanation: string }
  ): Promise<DiscrepancyReportApiResponse> => {
    await simulateApiDelay();
  
    try {
      const report = discrepancyReports.find(r => r.submissionId === submissionId);
      if (!report) {
        return { data: null, error: { error: 'Discrepancy report not found' } };
      }
  
      const discrepancyItem = report.items.find(item => item.rubricItemId === rubricItemId);
      if (!discrepancyItem) {
        return { data: null, error: { error: 'Discrepancy item not found' } };
      }
  
      discrepancyItem.resolution = {
        shouldBeApplied: resolutionData.resolution === 'instructor' ? discrepancyItem.wasApplied : !discrepancyItem.wasApplied,
        explanation: resolutionData.explanation,
        discrepancyType: resolutionData.resolution === 'instructor' ? 'grading_error' : 'student_error',
        resolvedBy: '2', // Replace with actual instructor ID
        resolvedAt: new Date()
      };
  
      if (report.items.every(item => item.resolution)) {
        report.status = 'resolved';
      }
      report.updatedAt = new Date();
      saveDiscrepancyReports(discrepancyReports);
      return { data: report };
    } catch (error) {
      console.error('Error resolving discrepancy report:', error);
      return { data: null, error: { error: 'Failed to resolve discrepancy report' } };
    }
  },
};

