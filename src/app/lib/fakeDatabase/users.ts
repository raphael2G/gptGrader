import { IUser } from '@@/models/User'

export const users: IUser[] = [
  {
    _id: '1',
    firebaseUid: 'firebase1',
    email: 'student1@andrew.cmu.edu',
    name: 'Student One',
    role: 'student',
    courses: ['course1', 'course2'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    _id: '2',
    firebaseUid: 'firebase2',
    email: 'instructor1@andrew.cmu.edu',
    name: 'Instructor One',
    role: 'instructor',
    courses: ['course1'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    _id: '3',
    firebaseUid: 'firebase3',
    email: 'student2@andrew.cmu.edu',
    name: 'Student Two',
    role: 'student',
    courses: ['course1'],
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02')
  },
  {
    _id: '4',
    firebaseUid: 'firebase4',
    email: 'student3@andrew.cmu.edu',
    name: 'Student Three',
    role: 'student',
    courses: ['course1', 'course2'],
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03')
  },
  {
    _id: '69',
    firebaseUid: 'firebase69',
    email: 'instructor69@andrew.cmu.edu',
    name: 'Instructor Sixty Nine',
    role: 'instructor',
    courses: ['course1', 'course2'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    _id: '5',
    firebaseUid: 'firebase5',
    email: 'student4@andrew.cmu.edu',
    name: 'Student Four',
    role: 'student',
    courses: ['course1'],
    createdAt: new Date('2023-01-04'),
    updatedAt: new Date('2023-01-04')
  },
  {
    _id: '6',
    firebaseUid: 'firebase6',
    email: 'student5@andrew.cmu.edu',
    name: 'Student Five',
    role: 'student',
    courses: ['course1'],
    createdAt: new Date('2023-01-05'),
    updatedAt: new Date('2023-01-05')
  },
  {
    _id: '7',
    firebaseUid: 'firebase7',
    email: 'student6@andrew.cmu.edu',
    name: 'Student Six',
    role: 'student',
    courses: ['course1'],
    createdAt: new Date('2023-01-06'),
    updatedAt: new Date('2023-01-06')
  },
  {
    _id: '8',
    firebaseUid: 'firebase8',
    email: 'student7@andrew.cmu.edu',
    name: 'Student Seven',
    role: 'student',
    courses: ['course1'],
    createdAt: new Date('2023-01-07'),
    updatedAt: new Date('2023-01-07')
  },
  {
    _id: '9',
    firebaseUid: 'firebase9',
    email: 'student8@andrew.cmu.edu',
    name: 'Student Eight',
    role: 'student',
    courses: ['course1'],
    createdAt: new Date('2023-01-08'),
    updatedAt: new Date('2023-01-08')
  }
]

export const getInstructorCourses = (userId: string): string[] => {
  const user = users.find(u => u._id === userId)
  if (user && user.role === 'instructor') {
    return user.courses
  }
  return []
}

export const getUserById = (userId: string): IUser | undefined => {
  return users.find(u => u._id === userId)
}

