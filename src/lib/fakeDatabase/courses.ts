import { ICourse } from '@/models/Course'

export const courses: ICourse[] = [
  {
    _id: 'course1',
    title: 'Introduction to Computer Science',
    courseCode: 'CS101',
    description: 'An introductory course to computer science',
    instructor: '2',
    semester: 'Fall',
    year: 2023,
    instructors: ['2', '69'],
    students: ['1'],
    assignments: ['assignment1', 'assignment2', 'assignment3', 'assignment4'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    _id: 'course2',
    title: 'Data Structures and Algorithms',
    courseCode: 'CS201',
    description: 'A course on fundamental data structures and algorithms',
    instructor: '2',
    semester: 'Spring',
    year: 2024,
    instructors: ['2', '69'],
    students: ['1'],
    assignments: [],
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-01')
  }
]

export const getCourseById = (courseId: string): ICourse | undefined => {
  return courses.find(course => course._id === courseId)
}

