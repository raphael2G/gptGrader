// app/api/discrepancy-reports/submission/[submissionId]/resolve/[rubricItemId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { resolveDiscrepancyReportItem } from '@/services/discrepancyReportServices';
import { Types } from 'mongoose';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { submissionId: string; rubricItemId: string } }
) {
  try {
    const { submissionId, rubricItemId } = params;
    const body = await request.json();
    const { shouldItemBeApplied, explanation, resolvedBy } = body;

    // Validate required fields
    if (shouldItemBeApplied === undefined || !explanation || !resolvedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }


    const resolution = {
      shouldItemBeApplied,
      explanation,
      resolvedBy: new Types.ObjectId(resolvedBy)
    };


    const report = await resolveDiscrepancyReportItem(
      new Types.ObjectId(submissionId),
      new Types.ObjectId(rubricItemId),
      resolution
    );


    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resolve discrepancy report' },
      { status: 500 }
    );
  }
}