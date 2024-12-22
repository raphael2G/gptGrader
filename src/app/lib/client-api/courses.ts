import { courses, getCourseById } from '../fakeDatabase/courses'
import { getInstructorCourses, users } from '../fakeDatabase/users'
import { ICourse } from '@@/models/Course'
import { IUser } from '@@/models/User'
import { simulateApiDelay } from '../utils/apiDelay'

interface ApiError {
  error: string
  details?: string
}

interface CourseApiResponse {
  data: ICourse | null
  error?: ApiError
}

interface CoursesApiResponse {
  data: ICourse[]
  error?: ApiError
}

interface DeleteCourseResponse {
  success: boolean
  error?: string
}

export const courseApi = {
  getInstructorCourses: async (): Promise<CoursesApiResponse> => {
    await simulateApiDelay();
    try {
      const userId = '69' // Assuming the instructor's ID is always 69
      const instructorCourseIds = getInstructorCourses(userId)
      const instructorCourses = courses.filter(course => instructorCourseIds.includes(course._id))
      return { data: instructorCourses }
    } catch (err) {
      return {
        data: [],
        error: { error: 'Failed to fetch instructor courses' }
      }
    }
  },

  getCourseById: async (courseId: string): Promise<CourseApiResponse> => {
    await simulateApiDelay();
    try {
      const course = getCourseById(courseId)
      if (course) {
        return { data: course }
      } else {
        return { data: null, error: { error: 'Course not found' } }
      }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to fetch course' }
      }
    }
  },

  createCourse: async (
    courseData: {
      title: string
      courseCode: string
      description: string
      instructor: string
      semester?: string
      year?: number
    },
    creatorId: string
  ): Promise<CourseApiResponse> => {
    await simulateApiDelay();
    try {
      const newCourse: ICourse = {
        _id: `course${courses.length + 1}`,
        ...courseData,
        instructors: [creatorId],
        students: [],
        assignments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      courses.push(newCourse)
      return { data: newCourse }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to create course' }
      }
    }
  },

  updateCourse: async (courseId: string, updateData: Partial<ICourse>): Promise<CourseApiResponse> => {
    await simulateApiDelay();
    try {
      const courseIndex = courses.findIndex(c => c._id === courseId)
      if (courseIndex !== -1) {
        courses[courseIndex] = { ...courses[courseIndex], ...updateData, updatedAt: new Date() }
        return { data: courses[courseIndex] }
      } else {
        return { data: null, error: { error: 'Course not found' } }
      }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to update course' }
      }
    }
  },

  deleteCourse: async (courseId: string): Promise<DeleteCourseResponse> => {
    await simulateApiDelay();
    try {
      const courseIndex = courses.findIndex(c => c._id === courseId)
      if (courseIndex !== -1) {
        courses.splice(courseIndex, 1)
        return { success: true }
      } else {
        return { success: false, error: 'Course not found' }
      }
    } catch (err) {
      return { success: false, error: 'Failed to delete course' }
    }
  },

  getStudentsInCourse: async (courseId: string): Promise<{ data: IUser[] | null, error?: ApiError }> => {
    await simulateApiDelay();
    try {
      const enrolledStudents = users.filter(user => 
        user.role === 'student' && user.courses.includes(courseId)
      );
      return { data: enrolledStudents };
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to fetch students in course' }
      };
    }
  },

  getStudentIdsInCourse: async (courseId: string): Promise<{ data: string[] | null, error?: ApiError }> => {
    await simulateApiDelay();
    try {
      const course = getCourseById(courseId)
      if (course) {
        return { data: course.students }
      } else {
        return { data: null, error: { error: 'Course not found' } }
      }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to fetch student IDs' }
      }
    }
  },
  getEnrolledCourses: async (userId: string): Promise<CoursesApiResponse> => {
    await simulateApiDelay();
    try {
      const enrolledCourseIds = users.find(u => u._id === userId)?.courses || [];
      const enrolledCourses = courses.filter(course => enrolledCourseIds.includes(course._id));
      return { data: enrolledCourses };
    } catch (err) {
      return {
        data: [],
        error: { error: 'Failed to fetch enrolled courses' }
      };
    }
  },
  addStudent: async (courseId: string, studentId: string): Promise<CourseApiResponse> => {
    await simulateApiDelay();
    try {
      const courseIndex = courses.findIndex(c => c._id === courseId);
      const userIndex = users.findIndex(u => u._id === studentId);
      
      if (courseIndex === -1) {
        return { data: null, error: { error: 'Course not found' } };
      }
      
      if (userIndex === -1) {
        return { data: null, error: { error: 'Student not found' } };
      }

      // Add student to course
      if (!courses[courseIndex].students.includes(studentId)) {
        courses[courseIndex].students.push(studentId);
      }

      // Add course to student's courses
      if (!users[userIndex].courses.includes(courseId)) {
        users[userIndex].courses.push(courseId);
      }

      return { data: courses[courseIndex] };
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to add student to course' }
      };
    }
  },
}

export default courseApi;

