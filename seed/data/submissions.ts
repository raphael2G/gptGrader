import mongoose from 'mongoose';
import { ids } from './ids';

export const submissions = Object.values(ids.users).flatMap((studentId, studentIndex) => {
  const problems = [
    {
      problemId: ids.assignments['introduction-to-algorithms']['divide-and-conquer-algorithms'].problems[0],
      possibleAnswers: [
        'Divide into subproblems, solve recursively, and combine results.', // Correct
        'Split into equal parts and solve directly.', // Incorrect
        'Divide, solve partially, and combine halfway.', // Partial credit
      ],
    },
    {
      problemId: ids.assignments['introduction-to-algorithms']['divide-and-conquer-algorithms'].problems[1],
      possibleAnswers: [
        'Merge Sort implemented correctly.', // Correct
        'Merge Sort with bugs in base case.', // Incorrect
        'Merge Sort partially implemented.', // Partial credit
      ],
    },
    {
      problemId: ids.assignments['introduction-to-algorithms']['divide-and-conquer-algorithms'].problems[2],
      possibleAnswers: [
        'Closest Pair solution implemented correctly.', // Correct
        'Closest Pair attempt with missing edge cases.', // Incorrect
        'Closest Pair partially working.', // Partial credit
      ],
    },
    {
      problemId: ids.assignments['introduction-to-algorithms']['divide-and-conquer-algorithms'].problems[3],
      possibleAnswers: [
        'Kadane’s algorithm implemented correctly.', // Correct
        'Kadane’s algorithm with missing explanation.', // Incorrect
        'Partial implementation of Kadane’s algorithm.', // Partial credit
      ],
    },
  ];

  // Generate submissions for each problem with a random answer
  return problems.map(({ problemId, possibleAnswers }, problemIndex) => {
    const randomAnswerIndex = (studentIndex + problemIndex) % possibleAnswers.length; // Make variation predictable but unique
    const answer = possibleAnswers[randomAnswerIndex];

    return {
      _id: new mongoose.Types.ObjectId(),
      assignmentId: ids.assignments['introduction-to-algorithms']['divide-and-conquer-algorithms'].id,
      problemId,
      studentId,
      answer,
      submittedAt: new Date(`2024-12-28T${10 + problemIndex}:00:00Z`),
      selfGraded: false, // Not self-graded
      graded: false, // Not graded
    };
  });
});
