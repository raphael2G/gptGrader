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
  rubricFinalized: boolean;
  referenceSolution: string;
}

export type IAssignment = {
  _id?: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  lateDueDate: Date;
  problems: IProblem[];
  isPublished: boolean;
  areGradesReleased: boolean;
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
  rubricFinalized: { type: Boolean, default: false }, 
  referenceSolution: { type: String, default: ''}
});

const assignmentSchema = new Schema<IAssignment>({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  lateDueDate: { type: Date, required: true },
  problems: [problemSchema],
  isPublished: { type: Boolean, required: true, default: false}, 
  areGradesReleased: { type: Boolean, required: true, default: false}, 
}, {
  timestamps: true
});

const Assignment = mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', assignmentSchema);

export { Assignment };