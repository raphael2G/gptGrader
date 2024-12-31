// app/api/discrepancy-reports/rubric-item/[rubricItemId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDiscrepancyReportsForRubricItem } from '@/services/discrepancyReportServices';
import { Types } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { rubricItemId: string } }
) {
  try {
    const rubricItemId = new Types.ObjectId(params.rubricItemId);
    const reports = await getDiscrepancyReportsForRubricItem(rubricItemId);
    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch discrepancy reports' },
      { status: 500 }
    );
  }
}