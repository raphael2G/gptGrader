import { ids } from './ids';
import { IUser } from '@/models/User';

const allCourseIds = Object.values(ids.courses);
export const realPeopleIds = [ids.users['darmfiels-id'], ids.users['asils-id'], ids.users['akeils-id']]


export const users: IUser[] = [
  // Add Derek Armfield as a manager of all courses
  {
    _id: ids.users['darmfiels-id'],
    firebaseUid: '2t2ObKpxI1bsNi8wJ9iQR2beVyb2',
    email: 'darmfiel@andrew.cmu.edu',
    name: 'Derek Armfield',
    enrolledCourses: [ids.courses['introduction-to-algorithms']], 
    managingCourses: allCourseIds, // Managing every course
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: ids.users['asils-id'],
    firebaseUid: 'BTzCqGcOJkU5AkeHYKAxcYRe3Js1',
    email: 'asilbekomonkulov2003@gmail.com',
    name: 'Asilbek Omonkulov',
    enrolledCourses: [ids.courses['introduction-to-algorithms']], 
    managingCourses: allCourseIds, // Managing every course
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: ids.users['akeils-id'],
    firebaseUid: '5bSZXc1urcf9ch8pfhdpOe9QtZi1',
    email: 'akeils@andrew.cmu.edu',
    name: 'Akeil Smith',
    enrolledCourses: [ids.courses['introduction-to-algorithms']], 
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
