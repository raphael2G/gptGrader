
// app/api/discrepancy-reports/assignment/[assignmentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDiscrepancyReportsForAssignment } from '@/services/discrepancyReportServices';
import { Types } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const assignmentId = new Types.ObjectId(params.assignmentId);
    const reports = await getDiscrepancyReportsForAssignment(assignmentId);
    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch discrepancy reports' },
      { status: 500 }
    );
  }
}