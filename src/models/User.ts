// models/User.ts
import mongoose, { Schema } from 'mongoose';

export type IUser = {
  _id?: mongoose.Types.ObjectId;
  firebaseUid: string;
  email: string;
  name?: string;
  enrolledCourses: mongoose.Types.ObjectId[];
  managingCourses: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: false },
  enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  managingCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
}, {
  timestamps: true // This adds createdAt and updatedAt fields
});

const User = mongoose.models?.User || mongoose.model<IUser>('User', userSchema);

export { User };