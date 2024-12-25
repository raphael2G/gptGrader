// app/api/discrepancy-reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createOrUpdateDiscrepancyReport } from '@/services/discrepancyReportServices';
import { Types } from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      submissionId,
      problemId,
      rubricItemId,
      studentId,
      courseId,
      assignmentId,
      wasOriginallyApplied,
      studentThinksShouldBeApplied,
      studentExplanation
    } = body;

    // Validate required fields
    if (!submissionId || !problemId || !rubricItemId || !studentId || !courseId || 
        !assignmentId || wasOriginallyApplied === undefined || 
        studentThinksShouldBeApplied === undefined || !studentExplanation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert string IDs to ObjectIds
    const discrepancyItem = {
      submissionId: new Types.ObjectId(submissionId),
      problemId: new Types.ObjectId(problemId),
      rubricItemId: new Types.ObjectId(rubricItemId),
      studentId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(courseId),
      assignmentId: new Types.ObjectId(assignmentId),
      wasOriginallyApplied,
      studentThinksShouldBeApplied,
      studentExplanation
    };

    const report = await createOrUpdateDiscrepancyReport(discrepancyItem);
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create discrepancy report' },
      { status: 500 }
    );
  }
}
