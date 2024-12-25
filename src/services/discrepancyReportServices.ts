// src/services/discrepancyReportServices.ts

import { Types } from 'mongoose';
import { 
  createOrUpdateDiscrepancyQuery,
  getDiscrepancyReportBySubmissionIdQuery,
  getDiscrepancyReportByAssignmentIdQuery,
  getDiscrepancyReportByRubricItemIdQuery,
  resolveDiscrepancyItemQuery
} from '@/queries/discrepancyReportQueries';
import { IDiscrepancyItem } from '@/models/DiscrepancyReport';

/**
 * Creates a new discrepancy report or updates an existing one by adding a new item
 */
export async function createOrUpdateDiscrepancyReport(
  discrepancyItem: Omit<IDiscrepancyItem, '_id' | 'createdAt' | 'updatedAt'>
) {
  try {
    const report = await createOrUpdateDiscrepancyQuery(discrepancyItem);
    return report;
  } catch (error) {
    throw new Error(`Failed to create/update discrepancy report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets a discrepancy report for a specific submission if it exists
 */
export async function getDiscrepancyReportForSubmission(submissionId: Types.ObjectId) {
  try {
    const report = await getDiscrepancyReportBySubmissionIdQuery(submissionId);
    return report;
  } catch (error) {
    throw new Error(`Failed to get discrepancy report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets all discrepancy reports for a specific assignment
 */
export async function getDiscrepancyReportsForAssignment(assignmentId: Types.ObjectId) {
  try {
    const reports = await getDiscrepancyReportByAssignmentIdQuery(assignmentId);
    return reports;
  } catch (error) {
    throw new Error(`Failed to get discrepancy reports for assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets all discrepancy reports containing a specific rubric item
 */
export async function getDiscrepancyReportsForRubricItem(rubricItemId: Types.ObjectId) {
  try {
    const reports = await getDiscrepancyReportByRubricItemIdQuery(rubricItemId);
    return reports;
  } catch (error) {
    throw new Error(`Failed to get discrepancy reports for rubric item: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Resolves a specific discrepancy item within a report
 */
export async function resolveDiscrepancyReportItem(
  submissionId: Types.ObjectId,
  rubricItemId: Types.ObjectId,
  resolution: {
    shouldItemBeApplied: boolean;
    explanation: boolean;
    resolvedBy: Types.ObjectId;
  }
) {
  try {
    const report = await resolveDiscrepancyItemQuery(submissionId, rubricItemId, resolution);
    return report;
  } catch (error) {
    throw new Error(`Failed to resolve discrepancy item: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}