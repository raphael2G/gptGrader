import mongoose, { Schema, Types } from 'mongoose';

export type IRubricItem = {
  _id?: mongoose.Types.ObjectId;
  description: string;
  points: number;
}

export type IProblem = {
  _id?: Types.ObjectId;  // Optional for new problems, present for existing ones
  question: string;
  maxPoints: number;
  orderIndex: number;
  rubric: {
    items: IRubricItem[];
  }
  rubricFinalized?: boolean;
  referenceSolution?: string;
}

export type IAssignment = {
  _id?: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  lateDueDate: Date;
  status: 'unreleased' | 'released' | 'closed' | 'graded';
  totalPoints: number;
  problems: IProblem[];
  gradingStatus?: "Not Started" | "In Progress" | "Finsihed"
  createdAt: Date;
  updatedAt: Date;
}

const rubricItemSchema = new Schema<IRubricItem>({
  description: { type: String, required: true },
  points: { type: Number, required: true }
});

const problemSchema = new Schema<IProblem>({
  question: { type: String, required: true },
  maxPoints: { type: Number, required: true },
  orderIndex: { type: Number, required: true },
  rubric: {
    items: [rubricItemSchema]
  }, 
  rubricFinalized: { type: Boolean }, 
  referenceSolution: { type: String }
});

const assignmentSchema = new Schema<IAssignment>({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  lateDueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['unreleased', 'released', 'closed', 'graded'],
    default: 'unreleased',
    required: true
  },
  totalPoints: { type: Number, required: true },
  problems: [problemSchema],
  gradingStatus: {
    type: String, 
    enum: ["Not Started", "In Progress", "Finished"], 
    default: 'Not Started',
    required: false
  }
}, {
  timestamps: true
});

const Assignment = mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', assignmentSchema);

export { Assignment };