import { User } from '@/models/User';
import { Types } from 'mongoose';
import dbConnect from '@/lib/mongodb/dbConnect';


export const findUserByFirebaseIdQuery = async (firebaseUid: string) => {
  await dbConnect();
  return User.findOne({ firebaseUid });
};

export const createUserQuery = async (userData: {
  firebaseUid: string;
  email: string;
  name?: string;
}) => {
  
  await dbConnect();

  const existingUser = await User.findOne({ 
    $or: [
      { firebaseUid: userData.firebaseUid },
      { email: userData.email }
    ]
  });

  if (existingUser) {
    throw new Error('User already exists with this Firebase ID or email');
  }

  const user = new User({
    ...userData,
    enrolledCourses: [],
    managingCourses: [],
    lastLogin: new Date(),
  });

  return user.save();
};


export const findUserCoursesQuery = async (userId: Types.ObjectId, role: 'student' | 'instructor') => {
  await dbConnect();

  const courseArrayToPopulate = role === 'student' ? 'enrolledCourses' : 'managingCourses';

  // Find user and get populated course details in one step
  const populatedCourses = await User.findById(userId)
    .populate({
      path: courseArrayToPopulate,
    })
    .then(user => {
      if (user) {
        return user?.[courseArrayToPopulate]
      } else {
        return []
      }})

  return populatedCourses;
};