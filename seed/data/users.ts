import { ids } from './ids';
import { IUser } from '@/models/User';

const allCourseIds = Object.values(ids.courses);

export const users: IUser[] = [
  // Add Derek Armfield as a manager of all courses
  {
    _id: ids.users['darmfiels-id'],
    firebaseUid: '2t2ObKpxI1bsNi8wJ9iQR2beVyb2',
    email: 'darmfiel@andrew.cmu.edu',
    name: 'Derek Armfield',
    enrolledCourses: [ids.courses['introduction-to-algorithms']], // Not enrolled as a student
    managingCourses: allCourseIds, // Managing every course
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // 20 other students
  ...Array.from({ length: 20 }, (_, i): IUser => (
    {
      _id: ids.users[`student-${i + 1}`],
      firebaseUid: `student${i + 1}_uid`,
      email: `student${i + 1}@andrew.cmu.edu`,
      name: `Student ${i + 1}`,
      enrolledCourses: [
        ids.courses['introduction-to-algorithms'],
        ids.courses['discrete-mathematics'],
      ],
      managingCourses: [], // Students don’t manage courses
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ))
];
