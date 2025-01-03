import mongoose from 'mongoose';
import { ids } from './ids';

export const assignments = [
  // Introduction to Algorithms Assignments
  {
    _id: ids.assignments['introduction-to-algorithms']['divide-and-conquer-algorithms'].id,
    courseId: ids.courses['introduction-to-algorithms'],
    title: 'Divide and Conquer Algorithms',
    description: 'Understand and implement divide-and-conquer strategies through real-world problems.',
    dueDate: new Date('2024-12-29'),
    lateDueDate: new Date('2024-12-29'),
    isPublished: true,
    problems: [
      {
        _id: ids.assignments['introduction-to-algorithms']['divide-and-conquer-algorithms'].problems[0],
        question: 'Explain the divide-and-conquer approach in solving complex problems.',
        maxPoints: 10,
        orderIndex: 0,
        rubric: {
          items: [
            { _id: new mongoose.Types.ObjectId(), description: 'Clear explanation of the strategy.', points: 5 },
            { _id: new mongoose.Types.ObjectId(), description: 'Use of relevant examples.', points: 5 },
          ],
        },
        rubricFinalized: true,
        referenceSolution: 'Divide a problem into smaller subproblems, solve them recursively, and combine results.',
        toBeSelfGraded: false,
      },
      {
        _id: ids.assignments['introduction-to-algorithms']['divide-and-conquer-algorithms'].problems[1],
        question: 'Implement Merge Sort and analyze its time complexity.',
        maxPoints: 20,
        orderIndex: 1,
        rubric: {
          items: [
            { _id: new mongoose.Types.ObjectId(), description: 'Correct implementation.', points: 15 },
            { _id: new mongoose.Types.ObjectId(), description: 'Detailed time complexity analysis.', points: 5 },
          ],
        },
        rubricFinalized: true,
        referenceSolution: 'O(n log n) for average and worst-case scenarios.',
        toBeSelfGraded: true,
      },
      {
        _id: ids.assignments['introduction-to-algorithms']['divide-and-conquer-algorithms'].problems[2],
        question: 'Design and implement an algorithm to find the closest pair of points in a 2D plane using divide-and-conquer.',
        maxPoints: 25,
        orderIndex: 2,
        rubric: {
          items: [
            { _id: new mongoose.Types.ObjectId(), description: 'Correct implementation of the algorithm.', points: 15 },
            { _id: new mongoose.Types.ObjectId(), description: 'Optimization and correctness checks.', points: 10 },
          ],
        },
        rubricFinalized: true,
        referenceSolution: 'Use a divide-and-conquer approach to recursively divide points and find the closest pair.',
        toBeSelfGraded: false,
      },
      {
        _id: ids.assignments['introduction-to-algorithms']['divide-and-conquer-algorithms'].problems[3],
        question: 'Apply the divide-and-conquer approach to solve the Maximum Subarray Problem.',
        maxPoints: 15,
        orderIndex: 3,
        rubric: {
          items: [
            { _id: new mongoose.Types.ObjectId(), description: 'Correct implementation of Kadane’s algorithm.', points: 10 },
            { _id: new mongoose.Types.ObjectId(), description: 'Proper explanation of the approach.', points: 5 },
          ],
        },
        rubricFinalized: true,
        referenceSolution: 'Use divide-and-conquer to split the array into subarrays and combine results.',
        toBeSelfGraded: true,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: ids.assignments['introduction-to-algorithms']['dynamic-programming'].id,
    courseId: ids.courses['introduction-to-algorithms'],
    title: 'Dynamic Programming',
    description: 'Practice problems on dynamic programming.',
    dueDate: new Date('2024-12-29'),
    lateDueDate: new Date('2024-12-29'),
    isPublished: true,
    problems: [
      {
        _id: ids.assignments['introduction-to-algorithms']['dynamic-programming'].problems[0],
        question: 'Explain the principles of dynamic programming.',
        maxPoints: 10,
        orderIndex: 0,
        rubric: {
          items: [
            { _id: new mongoose.Types.ObjectId(), description: 'Correct explanation.', points: 10 },
          ],
        },
        rubricFinalized: true,
        referenceSolution: 'Break problems into subproblems, solve each subproblem only once, and reuse results.',
        toBeSelfGraded: false,
      },
      {
        _id: ids.assignments['introduction-to-algorithms']['dynamic-programming'].problems[1],
        question: 'Implement the Knapsack Problem using dynamic programming.',
        maxPoints: 20,
        orderIndex: 1,
        rubric: {
          items: [
            { _id: new mongoose.Types.ObjectId(), description: 'Correct implementation.', points: 15 },
            { _id: new mongoose.Types.ObjectId(), description: 'Efficient use of memory.', points: 5 },
          ],
        },
        rubricFinalized: true,
        referenceSolution: 'Use a 2D array or optimized space approach for the Knapsack Problem.',
        toBeSelfGraded: true,
      },
      {
        _id: ids.assignments['introduction-to-algorithms']['dynamic-programming'].problems[2],
        question: 'Solve the Longest Common Subsequence problem.',
        maxPoints: 15,
        orderIndex: 2,
        rubric: {
          items: [
            { _id: new mongoose.Types.ObjectId(), description: 'Correct implementation.', points: 10 },
            { _id: new mongoose.Types.ObjectId(), description: 'Efficient time complexity.', points: 5 },
          ],
        },
        rubricFinalized: true,
        referenceSolution: 'Use a 2D DP table to calculate the LCS.',
        toBeSelfGraded: false,
      },
      {
        _id: ids.assignments['introduction-to-algorithms']['dynamic-programming'].problems[3],
        question: 'Explain memoization versus tabulation.',
        maxPoints: 10,
        orderIndex: 3,
        rubric: {
          items: [
            { _id: new mongoose.Types.ObjectId(), description: 'Correct explanation.', points: 10 },
          ],
        },
        rubricFinalized: true,
        referenceSolution: 'Memoization is top-down, and tabulation is bottom-up.',
        toBeSelfGraded: true,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
