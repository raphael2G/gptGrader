import mongoose, { Schema } from 'mongoose';

export type ICourse = {
  _id?: mongoose.Types.ObjectId;
  title: string;
  courseCode: string;
  description: string;
  instructor: string;
  semester: "Fall" | "Spring" | "Summer";
  year: number;
  instructors: mongoose.Types.ObjectId[]; // Reference to User
  students: mongoose.Types.ObjectId[]; // Reference to User
  assignments: mongoose.Types.ObjectId[]; // Reference to Assignment
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>({
  title: {type: String, required: true},
  courseCode: {type: String, required: true, unique: true},
  description: {type: String, required: true},
  instructor: {type: String, required: true},
  semester: {type: String, required: false},
  year: {type: Number, required: false},
  instructors: [{type: Schema.Types.ObjectId, ref: 'User'}],
  students: [{type: Schema.Types.ObjectId, ref: 'User'}],
  assignments: [{type: Schema.Types.ObjectId, ref: 'Assignment'}],
}, {
  timestamps: true
});

const Course = mongoose.models?.Course || mongoose.model<ICourse>('Course', courseSchema);

export { Course }