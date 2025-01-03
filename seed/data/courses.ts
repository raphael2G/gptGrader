import { ids } from './ids';

export const courses = [
  {
    _id: ids.courses['introduction-to-algorithms'],
    title: 'Introduction to Algorithms',
    courseCode: 'CS101',
    description: 'A foundational course on algorithms and data structures.',
    instructor: 'Derek Armfield',
    instructors: [ids.users['darmfiels-id']], // Reference instructor by ID
    students: Object.values(ids.users), // All students
    assignments: [
      ids.assignments['introduction-to-algorithms']['divide-and-conquer-algorithms'].id,
      ids.assignments['introduction-to-algorithms']['dynamic-programming'].id,
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: ids.courses['discrete-mathematics'],
    title: 'Discrete Mathematics',
    courseCode: 'CS102',
    description: 'An introduction to mathematical reasoning and discrete structures.',
    instructor: 'Derek Armfield',
    instructors: [ids.users['darmfiels-id']], // Reference instructor by ID
    students: Object.values(ids.users), // All students
    assignments: [
      ids.assignments['discrete-mathematics']['propositional-logic'].id,
      ids.assignments['discrete-mathematics']['number-theory'].id,
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
