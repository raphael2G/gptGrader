import { users, getUserById } from '../fakeDatabase/users'
import { IUser } from '@/models/User'
import { simulateApiDelay } from '../utils/apiDelay'

interface ApiError {
  error: string
  details?: string
}

interface UserApiResponse {
  data: IUser | null
  error?: ApiError
}

export const userApi = {
  create: async (
    firebaseUid: string,
    email: string,
    name?: string
  ): Promise<UserApiResponse> => {
    await simulateApiDelay();
    try {
      const newUser: IUser = {
        _id: (users.length + 1).toString(),
        firebaseUid,
        email,
        name: name || '',
        role: 'student',
        courses: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      users.push(newUser)
      return { data: newUser }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to create user' }
      }
    }
  },

  getUserById: async (userId: string): Promise<UserApiResponse> => {
    await simulateApiDelay();
    try {
      const user = getUserById(userId)
      if (user) {
        return { data: user }
      } else {
        return { data: null, error: { error: 'User not found' } }
      }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to fetch user' }
      }
    }
  },

  // Add other user-related API methods here
}

