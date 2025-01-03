import mongoose from 'mongoose';




export const ids = {
  courses: {
    'introduction-to-algorithms': new mongoose.Types.ObjectId(),
    'discrete-mathematics': new mongoose.Types.ObjectId(),
  },
  assignments: {
    'introduction-to-algorithms': {
      'divide-and-conquer-algorithms': {
        id: new mongoose.Types.ObjectId(),
        problems: [
          new mongoose.Types.ObjectId(), // Problem 0
          new mongoose.Types.ObjectId(), // Problem 1
          new mongoose.Types.ObjectId(), // Problem 2
          new mongoose.Types.ObjectId(), // Problem 3
        ],
      },
      'dynamic-programming': {
        id: new mongoose.Types.ObjectId(),
        problems: [
          new mongoose.Types.ObjectId(), // Problem 0
          new mongoose.Types.ObjectId(), // Problem 1
          new mongoose.Types.ObjectId(), // Problem 2
          new mongoose.Types.ObjectId(), // Problem 3
        ],
      },
    },
    'discrete-mathematics': {
      'propositional-logic': {
        id: new mongoose.Types.ObjectId(),
        problems: [
          new mongoose.Types.ObjectId(), // Problem 0
          new mongoose.Types.ObjectId(), // Problem 1
          new mongoose.Types.ObjectId(), // Problem 2
          new mongoose.Types.ObjectId(), // Problem 3
        ],
      },
      'number-theory': {
        id: new mongoose.Types.ObjectId(),
        problems: [
          new mongoose.Types.ObjectId(), // Problem 0
          new mongoose.Types.ObjectId(), // Problem 1
          new mongoose.Types.ObjectId(), // Problem 2
          new mongoose.Types.ObjectId(), // Problem 3
        ],
      },
    },
  },
  users: {
    'darmfiels-id': new mongoose.Types.ObjectId(),
    'asils-id': new mongoose.Types.ObjectId(),
    'akeils-id': new mongoose.Types.ObjectId(),
    ...Array.from({ length: 20 }, (_, i) => ({
      [`student-${i + 1}`]: new mongoose.Types.ObjectId(),
    })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),
  } as Record<string, mongoose.Types.ObjectId>,
};
