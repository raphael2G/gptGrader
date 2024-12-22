Self-Grading Process

This document describes the workflow and schema for implementing a self-grading process where students evaluate their own submissions before viewing the actual grades assigned by the instructors. This process encourages self-reflection and active engagement in the grading process.

Purpose

The self-grading feature serves to:

Allow students to evaluate their own work based on the rubric.

Encourage deeper understanding of the grading criteria.

Identify discrepancies between the student’s self-assessment and the official grading for further reflection or resolution.

Workflow

Submission Phase:

Students complete their work and submit their answers.

Self-Grading Phase:

After their work is graded and released, students are presented with the rubric and must grade their own submissions.

Students cannot view their actual grades until the self-grading is submitted.

The system stores the student’s self-assessment scores and comments for each rubric item.

Viewing Grades:

Once students submit their self-grading, they are allowed to view the actual grades assigned by the instructor or grader.

Discrepancy Reporting Phase:

For each discrepancy between the self-assessment and the actual grading, students can submit a discrepancy report.

Discrepancy reports include:

Whether the student believes they were correct, and the grading was wrong, or vice versa.

A detailed explanation supporting their claim.

Resolution Phase:

Course staff reviews and resolves each discrepancy report.

Resolutions are documented with comments, a resolution type, and a timestamp.

Schema Definition

Submission Schema

The Submission schema stores the initial student submission along with their self-assessment.

export type ISubmission = {
  _id?: mongoose.Types.ObjectId;
  assignmentId: mongoose.Types.ObjectId; // Links to the assignment
  studentId: mongoose.Types.ObjectId; // Links to the student
  answer: string; // The student's submitted answer
  submittedAt: Date; // Timestamp for submission

  // Self-assessment data
  selfAssessment: {
    rubricItemId: mongoose.Types.ObjectId; // Links to the rubric item
    selfScore: number; // The score given by the student
    selfFeedback?: string; // Optional comments from the student
  }[];

  // Grading data
  graded: boolean; // Indicates if the submission has been graded
  gradedBy?: mongoose.Types.ObjectId; // Reference to the grader
  gradedAt?: Date; // Timestamp for grading completion
  feedback?: string; // Feedback provided by the grader

  createdAt: Date;
  updatedAt: Date;
};

Self-Assessment Fields

rubricItemId: Identifies the specific rubric item being evaluated.

selfScore: The score assigned by the student during self-assessment.

selfFeedback: Optional comments or reasoning for the assigned score.

Discrepancy Report Schema

The DiscrepancyReport schema tracks any discrepancies between the student’s self-assessment and the grader’s evaluation.

export type IDiscrepancyReport = {
  _id?: mongoose.Types.ObjectId;
  submissionId: mongoose.Types.ObjectId; // Links to the specific submission
  problemId: mongoose.Types.ObjectId; // Links to the problem within the submission
  rubricItemId: mongoose.Types.ObjectId; // Links to the specific rubric item
  studentId: mongoose.Types.ObjectId; // Links to the student who filed the report

  // Grading comparison
  actualScore: number; // The score assigned by the grader
  selfScore: number; // The score assigned by the student
  studentClaim: 'self-wrong' | 'grading-wrong'; // Nature of the claim
  studentExplanation: string; // Explanation provided by the student

  // Resolution details
  resolutionStatus: 'pending' | 'resolved'; // Status of the report
  resolutionType?: 'grade-adjusted' | 'no-change' | 'other'; // Outcome of the resolution
  instructorComments?: string; // Comments from the instructor/grader
  resolvedAt?: Date; // Timestamp for resolution
  resolvedBy?: mongoose.Types.ObjectId; // Reference to the grader/admin resolving it

  createdAt: Date;
  updatedAt: Date;
};

API Endpoints

Submit Self-Assessment

Endpoint: POST /api/self-assessments

Input:

{
  "submissionId": "<submissionId>",
  "selfAssessment": [
    {
      "rubricItemId": "<rubricItemId>",
      "selfScore": 8,
      "selfFeedback": "I believe my answer fully meets the requirements."
    },
    {
      "rubricItemId": "<rubricItemId>",
      "selfScore": 6,
      "selfFeedback": "I missed a key point but addressed most of the problem."
    }
  ]
}

Logic:

Validate that the submission exists.

Save the self-assessment scores and comments in the Submission document.

Compare Self-Assessment with Actual Grades

Endpoint: GET /api/self-assessments/compare/:submissionId

Output:

{
  "submissionId": "<submissionId>",
  "selfAssessment": [
    {
      "rubricItemId": "<rubricItemId>",
      "selfScore": 8,
      "actualScore": 6,
      "discrepancy": true
    },
    {
      "rubricItemId": "<rubricItemId>",
      "selfScore": 6,
      "actualScore": 6,
      "discrepancy": false
    }
  ]
}

Logic:

Fetch the submission and grading data.

Compare self-assessment scores with actual grades.

Identify discrepancies and return a structured response.

Submit Discrepancy Report

Endpoint: POST /api/discrepancy-reports

Input:

{
  "submissionId": "<submissionId>",
  "problemId": "<problemId>",
  "rubricItemId": "<rubricItemId>",
  "selfScore": 8,
  "actualScore": 6,
  "studentClaim": "grading-wrong",
  "studentExplanation": "I believe my answer aligns with the rubric."
}

Resolve a Discrepancy Report

Endpoint: PATCH /api/discrepancy-reports/:id

Input:

{
  "resolutionStatus": "resolved",
  "resolutionType": "grade-adjusted",
  "instructorComments": "Updated grade based on additional review.",
  "resolvedBy": "<userId>"
}

Advantages of the Design

Encourages Active Learning: Students are required to reflect on their work and understand the rubric.

Transparency: Discrepancies between self-assessment and grading are clearly identified.

Actionable Feedback: The process provides structured opportunities for students to understand their mistakes and seek clarifications.

Feel free to expand on this design or let me know if further refinement is needed!



Discrepancy Reports

This document outlines the structure and usage of the DiscrepancyReport model within the system. It is designed to handle discrepancies between a student’s self-assessment and the actual grading provided by instructors or graders.

Purpose

Discrepancy reports serve as a formal mechanism for students to address differences between their self-assessed grades and the official grading. These reports allow students to:

Accept discrepancies and explain their new understanding.

Dispute discrepancies and provide reasoning for why they believe the grading is incorrect.

Schema Definition

The DiscrepancyReport model is stored as a separate collection in the database and linked to specific submissions.

import mongoose, { Schema, Types } from 'mongoose';

export type IDiscrepancyReport = {
  _id?: mongoose.Types.ObjectId;
  submissionId: mongoose.Types.ObjectId; // Links to the specific submission
  problemId: mongoose.Types.ObjectId; // Links to the problem within the submission
  rubricItemId: mongoose.Types.ObjectId; // Links to the specific rubric item
  studentId: mongoose.Types.ObjectId; // Links to the student who filed the report

  // Grading comparison
  actualScore: number; // The score assigned by the grader
  selfScore: number; // The score assigned by the student
  studentClaim: 'self-wrong' | 'grading-wrong'; // Nature of the claim
  studentExplanation: string; // Explanation provided by the student

  // Resolution details
  resolutionStatus: 'pending' | 'resolved'; // Status of the report
  resolutionType?: 'grade-adjusted' | 'no-change' | 'other'; // Outcome of the resolution
  instructorComments?: string; // Comments from the instructor/grader
  resolvedAt?: Date; // Timestamp for resolution
  resolvedBy?: mongoose.Types.ObjectId; // Reference to the grader/admin resolving it

  createdAt: Date; // Timestamp for report creation
  updatedAt: Date; // Timestamp for the last update
};

const discrepancyReportSchema = new Schema<IDiscrepancyReport>({
  submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true },
  problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
  rubricItemId: { type: Schema.Types.ObjectId, ref: 'RubricItem' },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  actualScore: { type: Number, required: true },
  selfScore: { type: Number, required: true },
  studentClaim: {
    type: String,
    enum: ['self-wrong', 'grading-wrong'],
    required: true,
  },
  studentExplanation: { type: String, required: true },
  resolutionStatus: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending',
  },
  resolutionType: {
    type: String,
    enum: ['grade-adjusted', 'no-change', 'other'],
  },
  instructorComments: { type: String },
  resolvedAt: { type: Date },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true, // Automatically manage `createdAt` and `updatedAt`
});

const DiscrepancyReport = mongoose.models.DiscrepancyReport || mongoose.model<IDiscrepancyReport>('DiscrepancyReport', discrepancyReportSchema);

export { DiscrepancyReport };

Key Fields

Relationships

submissionId: Links the discrepancy report to the specific submission.

problemId: Identifies the problem or question within the submission.

rubricItemId: Optionally links to a specific rubric item for finer granularity.

studentId: Identifies the student who filed the report.

Grading Comparison

actualScore: The score assigned by the grader.

selfScore: The score assigned by the student during self-assessment.

studentClaim: Indicates whether the student accepts responsibility for the discrepancy or believes the grading was incorrect.

studentExplanation: A detailed explanation provided by the student for their claim.

Resolution

resolutionStatus: Tracks whether the report is pending or resolved.

resolutionType: Classifies the resolution as a grade adjustment, no change, or other action.

instructorComments: Allows instructors to document their reasoning or notes during resolution.

resolvedAt: Timestamp for when the discrepancy was resolved.

resolvedBy: References the grader or admin who resolved the report.

Timestamps

createdAt: Automatically managed timestamp for when the report was created.

updatedAt: Automatically managed timestamp for the last update.

Workflow

Self-Assessment Phase:

The student completes their self-assessment after grading is completed.

Discrepancies between the self-assessment and the grader’s scores are identified.

Discrepancy Filing:

Students file a discrepancy report for each issue.

Reports include the selfScore, actualScore, and an explanation.

Resolution Phase:

Instructors or graders review the discrepancy reports.

Resolutions are documented with a resolutionType and optional comments.

The resolutionStatus is updated to "resolved," and the resolvedAt timestamp is recorded.

API Endpoints

Create a Discrepancy Report

Endpoint: POST /api/discrepancy-reports

Input:

{
  "submissionId": "<submissionId>",
  "problemId": "<problemId>",
  "rubricItemId": "<rubricItemId>",
  "selfScore": 8,
  "actualScore": 6,
  "studentClaim": "grading-wrong",
  "studentExplanation": "I believe my answer aligns with the rubric."
}

Resolve a Discrepancy Report

Endpoint: PATCH /api/discrepancy-reports/:id

Input:

{
  "resolutionStatus": "resolved",
  "resolutionType": "grade-adjusted",
  "instructorComments": "Updated grade based on additional review.",
  "resolvedBy": "<userId>"
}

Get Discrepancy Reports for a Submission

Endpoint: GET /api/discrepancy-reports?submissionId=<submissionId>

Output:

[
  {
    "_id": "<reportId>",
    "problemId": "<problemId>",
    "rubricItemId": "<rubricItemId>",
    "actualScore": 6,
    "selfScore": 8,
    "studentClaim": "grading-wrong",
    "studentExplanation": "I believe my answer aligns with the rubric.",
    "resolutionStatus": "pending"
  }
]

Advantages of the Design

Scalability: By storing discrepancy reports in a separate collection, the model supports a large number of reports without bloating the Submission document.

Flexibility: The schema supports detailed resolution workflows and provides a clear audit trail.

Usability: The fields and relationships enable intuitive API usage and easy integration into the overall grading workflow.

Feel free to adapt this design based on additional requirements or feedback!

