import mongoose, { Schema } from 'mongoose';

export type IDiscrepancyItem = {
  _id: mongoose.Types.ObjectId;
  submissionId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  assignmentId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  rubricItemId: mongoose.Types.ObjectId;

  wasOriginallyApplied: boolean;
  studentThinksShouldBeApplied: boolean;
  studentExplanation: string;

  resolution? : {
    shouldItemBeApplied: boolean;
    explanation: boolean;
    resolvedBy: mongoose.Types.ObjectId; // reference to a user, {type: Schema.Types.ObjectId, ref: 'User'}
    resolvedAt: Date;
  }

  createdAt: Date;
  updatedAt: Date;
}

export interface IDiscrepancyReport {
  _id: mongoose.Types.ObjectId;
  submissionId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  assignmentId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  
  status: 'pending' | 'resolved';
  items: IDiscrepancyItem[];
  createdAt: Date;
  updatedAt: Date;
}


const discrepancyItemSchema = new Schema<IDiscrepancyItem>({
  submissionId: { type: Schema.Types.ObjectId, required: true, ref: 'Submission' },
  studentId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  courseId: { type: Schema.Types.ObjectId, required: true, ref: 'Course' },
  assignmentId: { type: Schema.Types.ObjectId, required: true, ref: 'Assignment' },
  problemId: { type: Schema.Types.ObjectId, required: true, ref: 'Problem' },
  rubricItemId: { type: Schema.Types.ObjectId, required: true, ref: 'RubricItem' },

  wasOriginallyApplied: { type: Boolean, required: true },
  studentThinksShouldBeApplied: { type: Boolean, required: true },
  studentExplanation: { type: String, required: true },

  resolution: {
    type: {
      shouldItemBeApplied: { type: Boolean, required: true },
      explanation: { type: Boolean, required: true },
      resolvedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
      resolvedAt: { type: Date, required: true }
    },
    required: false
  }
}, {
  timestamps: true
});

const discrepancyReportSchema = new Schema<IDiscrepancyReport>({
  submissionId: { type: Schema.Types.ObjectId, required: true, ref: 'Submission' },
  studentId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  courseId: { type: Schema.Types.ObjectId, required: true, ref: 'Course' },
  assignmentId: { type: Schema.Types.ObjectId, required: true, ref: 'Assignment' },
  problemId: { type: Schema.Types.ObjectId, required: true, ref: 'Problem' },

  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'resolved'],
    default: 'pending'
  },
  
  items: [discrepancyItemSchema]
}, {
  timestamps: true
});


const DiscrepancyReport = mongoose.models?.DiscrepancyReport || mongoose.model<IDiscrepancyReport>('DiscrepancyReport', discrepancyReportSchema);

export { DiscrepancyReport }