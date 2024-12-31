// app/api/discrepancy-reports/submission/[submissionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDiscrepancyReportForSubmission } from '@/services/discrepancyReportServices';
import { Types } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const submissionId = new Types.ObjectId(params.submissionId);
    const report = await getDiscrepancyReportForSubmission(submissionId);
    
    if (!report) {
      return NextResponse.json({ error: 'Discrepancy report not found' }, { status: 404 });
    }
    
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch discrepancy report' },
      { status: 500 }
    );
  }
}