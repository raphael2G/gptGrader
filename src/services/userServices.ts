import { Types } from 'mongoose';
import { findUserByFirebaseIdQuery, createUserQuery, findUserCoursesQuery, getUserByIdQuery } from '@/queries/userQueries';



export async function getUserById(userId: Types.ObjectId) {
  try {
    const user = await getUserByIdQuery(userId);
    return user
  } catch (error) {
    throw new Error(`Failed to get course: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}




interface CreateUserData {
  firebaseUid: string;
  email: string;
  name?: string;
}

/**
 * Creates a new user in the database if they don't already exist
 * @param userData User data from Firebase authentication
 * @returns Created user object or existing user if found
 */
export async function createUser(userUid: string, userEmail: string, userName: string | null) {
  const userData: CreateUserData = {
    firebaseUid: userUid,
    email: userEmail,
    name: userName ?? undefined
  };
  try {
    // Check if user already exists
    const existingUser = await findUserByFirebaseIdQuery(userData.firebaseUid);
    if (existingUser) {
      return existingUser;
    }

    // Create new user if they don't exist
    const newUser = await createUserQuery(userData);
    return newUser;
  } catch (error) {
    throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


/**
 * Gets all active courses where the user is enrolled as a student
 * Note: Consider moving this to courseServices
 * @param userId MongoDB ObjectId of the user
 * @returns Array of populated course objects
 */
export async function getStudentCourses(userId: Types.ObjectId) {
  try {
    const courses = await findUserCoursesQuery(userId, 'student');
    return courses;
  } catch (error) {
    console.log("error")
    throw new Error(`Failed to fetch student courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets all active courses where the user is an instructor
 * Note: Consider moving this to courseServices
 * @param userId MongoDB ObjectId of the user
 * @returns Array of populated course objects
 */
export async function getInstructorCourses(userId: Types.ObjectId) {
  try {
    const courses = await findUserCoursesQuery(userId, 'instructor');
    return courses;
  } catch (error) {
    throw new Error(`Failed to fetch instructor courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}