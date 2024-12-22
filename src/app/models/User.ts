export interface IUser {
  _id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: 'student' | 'instructor';
  courses: string[];
  createdAt: Date;
  updatedAt: Date;
}

