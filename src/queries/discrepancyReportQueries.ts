import { Types } from 'mongoose';
import mongoose from 'mongoose';
import { DiscrepancyReport, IDiscrepancyItem } from '@/models/DiscrepancyReport';
import { Assignment, IRubricItem } from '@/models/Assignment';
import { Submission } from '@/models/Submission';
import dbConnect from '@/lib/mongodb/dbConnect';

/**
 * Creates a new discrepancy report or updates an existing one by adding a new discrepancy item
 * @param discrepancyItem The discrepancy item to add
 * @returns The created or updated discrepancy report
 */
export async function createOrUpdateDiscrepancyQuery(discrepancyItem: Omit<IDiscrepancyItem, '_id' | 'createdAt' | 'updatedAt'>) {
  await dbConnect();
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check for existing report for this submission
    let report = await DiscrepancyReport.findOne({
      submissionId: discrepancyItem.submissionId,
      studentId: discrepancyItem.studentId,
      problemId: discrepancyItem.problemId
    }).session(session);

    if (report) {
      // Add new item to existing report
      report.items.push(discrepancyItem);
      
      // Check if any items are unresolved
      const hasUnresolvedItems = report.items.some((item: IDiscrepancyItem)  => !item.resolution);
      report.status = hasUnresolvedItems ? 'pending' : 'resolved';
      
      await report.save({ session });
    } else {
      // Create new report with this item
      report = new DiscrepancyReport({
        submissionId: discrepancyItem.submissionId,
        studentId: discrepancyItem.studentId,
        courseId: discrepancyItem.courseId,
        assignmentId: discrepancyItem.assignmentId,
        problemId: discrepancyItem.problemId,
        status: 'pending',
        items: [discrepancyItem]
      });
      
      await report.save({ session });
    }

    await session.commitTransaction();
    return report;
  } catch (error) {
    await session.abortTransaction();
    throw new Error(`Failed to create/update discrepancy report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    session.endSession();
  }
}

/**
 * Gets a discrepancy report by submission ID
 * @param submissionId The ID of the submission
 * @returns The discrepancy report if found, null if not found
 * @throws Error if the submission does not exist
 */
export async function getDiscrepancyReportBySubmissionIdQuery(submissionId: Types.ObjectId) {
  await dbConnect();
  
  try {
    // First verify the submission exists
    const submissionExists = await Submission.findById(submissionId);
    if (!submissionExists) {
      throw new Error(`Submission with ID ${submissionId} does not exist`);
    }

    // If submission exists, find its report
    const report = await DiscrepancyReport.findOne({ 'submissionId': submissionId });
    return report || null;
  } catch (error) {
    if (error instanceof Error) {
      throw error; // Re-throw our custom error
    }
    throw new Error(`Failed to fetch discrepancy report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets all discrepancy reports for an assignment
 * @param assignmentId The ID of the assignment
 * @returns Array of discrepancy reports
 */
export async function getDiscrepancyReportByAssignmentIdQuery(assignmentId: Types.ObjectId) {
  await dbConnect();
  
  try {
    // First verify the assignment exists
    const assignmentExists = await Assignment.findById(assignmentId);
    if (!assignmentExists) {
      throw new Error(`Assignment with ID ${assignmentId} does not exist`);
    }

    // If assignment exists, find any reports for it
    const reports = await DiscrepancyReport.find({ 'assignmentId': assignmentId });
    return reports;
  } catch (error) {
    throw new Error(`Failed to fetch discrepancy reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets all discrepancy reports containing a specific rubric item
 * @param rubricItemId The ID of the rubric item
 * @returns Array of discrepancy reports
 */
/**
 * Gets all discrepancy reports that contain a specific rubric item in their items array
 * Uses MongoDB dot notation to query nested array elements
 * 
 * @param rubricItemId The ID of the rubric item to search for
 * @returns Array of discrepancy reports that contain the specified rubric item
 */
export async function getDiscrepancyReportByRubricItemIdQuery(rubricItemId: Types.ObjectId) {
  await dbConnect();
  
  try {
    // This query uses dot notation to search inside the items array
    // Will match any document where at least one item in the items array
    // has a rubricItemId matching our search parameter
    // First verify the rubric item exists by checking assignments
    const assignmentWithRubricItem = await Assignment.findOne({
      'problems.rubric.items._id': rubricItemId
    });

    if (!assignmentWithRubricItem) {
      throw new Error(`Rubric item with ID ${rubricItemId} does not exist in any assignment`);
    }
    // If rubric item exists, find any reports containing it
    const reports = await DiscrepancyReport.find({
      'items.rubricItemId': rubricItemId
    });

    // Return reports array (empty if none found)
    return reports;
  } catch (error) {
    if (error instanceof Error) {
      throw error; // Re-throw our custom error
    }
    throw new Error(`Failed to fetch discrepancy reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Resolves a discrepancy item within a report
 * @param submissionId The ID of the submission
 * @param rubricItemId The ID of the rubric item
 * @param resolution The resolution details
 * @returns The updated discrepancy report
 */
export async function resolveDiscrepancyItemQuery(
  submissionId: Types.ObjectId,
  rubricItemId: Types.ObjectId,
  resolution: {
    shouldItemBeApplied: boolean;
    explanation: string;
    resolvedBy: Types.ObjectId;
  }
) {
  await dbConnect();
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Instead of finding and updating in memory, use updateOne with $set
    console.log("Schema of resolution.explanation:", DiscrepancyReport.schema.path('items.0.resolution.explanation'));
  console.log("Type of incoming explanation:", typeof resolution.explanation);
      const result = await DiscrepancyReport.updateOne(
      {
        "submissionId": submissionId,
        "items.rubricItemId": rubricItemId
      },
      {
        $set: {
          [`items.$.resolution`]: {
            shouldItemBeApplied: resolution.shouldItemBeApplied,
            explanation: resolution.explanation,
            resolvedBy: resolution.resolvedBy,
            resolvedAt: new Date()
          }
        }
      },
      { session }
    );

    if (result.matchedCount === 0) {
      throw new Error(`No discrepancy item found for rubric item ID: ${rubricItemId} in report`);
    }

    // Now fetch the updated document
    const updatedReport = await DiscrepancyReport.findOne({
      "submissionId": submissionId
    }).session(session);

    if (!updatedReport) {
      throw new Error(`No discrepancy report found for submission ID: ${submissionId}`);
    }

    // Check if all items are resolved
    const allResolved = updatedReport.items.every((item: IDiscrepancyItem) => item.resolution);
    if (allResolved) {
      updatedReport.status = 'resolved';
      await updatedReport.save({ session });
    }

    await session.commitTransaction();
    return updatedReport;

  } catch (error) {
    await session.abortTransaction();
    throw new Error(`Failed to resolve discrepancy item: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    session.endSession();
  }
}