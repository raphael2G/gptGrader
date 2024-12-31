// app/api/discrepancy-reports/submission/[submissionId]/resolve/[rubricItemId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { resolveDiscrepancyReportItem } from '@/services/discrepancyReportServices';
import { Types } from 'mongoose';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { submissionId: string; rubricItemId: string } }
) {
  try {
    console.log("at the api, at least we are trying")
    const { submissionId, rubricItemId } = params;
    const body = await request.json();
    const { shouldItemBeApplied, explanation, resolvedBy } = body;

    // Validate required fields
    if (shouldItemBeApplied === undefined || !explanation || !resolvedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log("our fields made itpast validation")

    const resolution = {
      shouldItemBeApplied,
      explanation,
      resolvedBy: new Types.ObjectId(resolvedBy)
    };

    console.log("have our resolution too")

    const report = await resolveDiscrepancyReportItem(
      new Types.ObjectId(submissionId),
      new Types.ObjectId(rubricItemId),
      resolution
    );

    console.log("made it past hte attept")

    return NextResponse.json(report);
  } catch (error) {
    console.log("here is the error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resolve discrepancy report' },
      { status: 500 }
    );
  }
}