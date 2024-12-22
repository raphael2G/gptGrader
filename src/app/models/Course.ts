export interface ICourse {
  _id: string;
  title: string;
  courseCode: string;
  description: string;
  instructor: string;
  semester?: string;
  year?: number;
  instructors: string[];
  students: string[];
  assignments: string[];
  createdAt: Date;
  updatedAt: Date;
}

