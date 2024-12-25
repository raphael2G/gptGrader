import mongoose, { Schema } from 'mongoose';

export type ISubmission = {
  _id?: mongoose.Types.ObjectId;
  assignmentId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  answer: string;
  submittedAt: Date;
  graded: boolean;
  gradedBy?: mongoose.Types.ObjectId; // Reference to User
  gradedAt?: Date;
  appliedRubricItems?: mongoose.Types.ObjectId[]; // Reference to the RubricItems that are applied
  feedback?: string;

  // self grading stuff
  selfGraded: boolean, // flag for if complete or not
  selfGradedAppliedRubricItems: mongoose.Types.ObjectId[]; // Reference to self graded applied RubricItems
  selfGradingCompletedAt?: Date;


  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  problemId: { type: Schema.Types.ObjectId, ref: 'Assignment.problems', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answer: { type: String, required: true },
  submittedAt: { type: Date, required: true },
  graded: { type: Boolean, required: true },
  gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  gradedAt: { type: Date },
  appliedRubricItems: [{ type: Schema.Types.ObjectId, ref: 'Assignment.problems.rubric.items' }],
  feedback: { type: String },

  selfGraded: { type: Boolean, required: false, default: false},
  selfGradedAppliedRubricItems: [{ type: Schema.Types.ObjectId, ref: 'Assignment.problems.rubric.items' }],
  selfGradingCompletedAt: { type: Date, required: false}

}, {
  timestamps: true
});

const Submission = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', submissionSchema);

export { Submission };