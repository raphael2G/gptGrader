import { Assignment } from '@/models/Assignment';
import { Course } from '@/models/Course';
import { Submission } from '@/models/Submission';
import { Types } from 'mongoose';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb/dbConnect';
import { IAssignment, IProblem, IRubricItem } from '@/models/Assignment';



export const getAssignmentByIdQuery = async (assignmentId: Types.ObjectId) => {
  await dbConnect();
  return Assignment.findById(assignmentId);
};

/**
 * Creates a new assignment and adds it to the course's assignments array
 * 
 * @param courseId - The MongoDB ObjectId of the course to add the assignment to
 * @param assignmentData - Assignment data excluding courseId and timestamps
 * @returns Promise containing the newly created assignment document
 * @throws {Error} If course is not found or if creation fails
 * 
 * @example
 * ```typescript
 * const newAssignment = await createAssignmentQuery(courseId, {
 *   title: "Midterm Assignment",
 *   description: "Complete all problems",
 *   dueDate: new Date("2024-12-01"),
 *   lateDueDate: new Date("2024-12-03"),
 *   status: "unreleased",
 *   totalPoints: 100,
 *   problems: []
 * });
 * ```
 */
export const createAssignmentQuery = async (
  courseId: Types.ObjectId,
  assignmentData: Omit<IAssignment, '_id' | 'courseId' | 'createdAt' | 'updatedAt' >
) => {
  await dbConnect();
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create the assignment
    const assignment = new Assignment({
      ...assignmentData,
      courseId,
      problems: assignmentData.problems || []
    });

    // Save the assignment
    const savedAssignment = await assignment.save({ session });

    // Add assignment reference to course
    await Course.findByIdAndUpdate(
      courseId,
      { $push: { assignments: savedAssignment._id } },
      { session }
    );

    await session.commitTransaction();
    return savedAssignment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Updates basic assignment details (not problems or rubrics)
 * 
 * @param assignmentId - The MongoDB ObjectId of the assignment to update
 * @param updateData - Partial assignment data containing fields to update
 * @returns Promise containing the updated assignment document
 * @throws {Error} If assignment is not found or if update validation fails
 * 
 * @example
 * ```typescript
 * const updatedAssignment = await updateAssignmentQuery(assignmentId, {
 *   title: "Updated Midterm Assignment",
 *   status: "released",
 *   dueDate: new Date("2024-12-05")
 * });
 * ```
 */
export const updateAssignmentQuery = async (
  assignmentId: Types.ObjectId,
  updateData: Partial<Omit<IAssignment, '_id' | 'problems' | 'courseId' | 'createdAt' | 'updatedAt' >>
) => {
  await dbConnect();
  
  return Assignment.findByIdAndUpdate(
    assignmentId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

/**
 * Deletes an assignment and removes it from the course's assignments array.
 * Also removes all related submissions.
 * 
 * @param assignmentId - The MongoDB ObjectId of the assignment to delete
 * @returns Promise containing the deleted assignment document
 * @throws {Error} If assignment is not found or if deletion fails
 * 
 * @example
 * ```typescript
 * const deletedAssignment = await deleteAssignmentQuery(assignmentId);
 * ```
 */
export const deleteAssignmentQuery = async (assignmentId: Types.ObjectId) => {
  await dbConnect();
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get assignment to find courseId
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Remove assignment reference from course
    await Course.findByIdAndUpdate(
      assignment.courseId,
      { $pull: { assignments: assignmentId } },
      { session }
    );

    // Delete all submissions for this assignment
    await Submission.deleteMany({ assignmentId }, { session });

    // Delete the assignment
    await Assignment.findByIdAndDelete(assignmentId).session(session);

    await session.commitTransaction();
    return assignment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Adds or updates a problem in an assignment.
 * If problem has matching _id, updates that problem.
 * If no _id provided or not found, adds as new problem.
 * Automatically updates assignment totalPoints.
 * 
 * @param assignmentId - The MongoDB ObjectId of the assignment
 * @param problemData - The problem data to add or update
 * @returns Promise containing the updated assignment document
 * @throws {Error} If assignment is not found or if problem data is invalid
 * 
 * @example
 * ```typescript
 * // Update existing problem
 * const updatedAssignment = await upsertProblemQuery(assignmentId, {
 *   _id: existingProblemId,  // MongoDB ObjectId of existing problem
 *   question: "Updated question",
 *   maxPoints: 20,
 *   orderIndex: 1,
 *   rubric: {
 *     items: []
 *   }
 * });
 * 
 * // Add new problem
 * const newAssignment = await upsertProblemQuery(assignmentId, {
 *   question: "New question",
 *   maxPoints: 20,
 *   orderIndex: 2,
 *   rubric: {
 *     items: []
 *   }
 * });
 * ```
 */
export const upsertProblemQuery = async (
  assignmentId: Types.ObjectId,
  problemData: Partial<IProblem>
) => {
  await dbConnect();
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const assignment = await Assignment.findById(assignmentId).session(session);
    console.log("found assignment")

    if (!assignment) {
      console.log("did not find assignment")
      throw new Error('Assignment not found');
    }

    if (problemData._id) {

      // Update existing problem
      const existingProblemIndex = assignment.problems.findIndex(
        (p: IProblem & { _id: Types.ObjectId }) => p._id.toString() === problemData._id!.toString()
      );

      



      if (existingProblemIndex >= 0) {

        console.log("fonud problem")
        console.log("fonud problem")
        console.log("fonud problem")
        console.log("fonud problem")
        console.log("goofy")

        // Preserve existing _id and merge with new data
        assignment.problems[existingProblemIndex] = {
          ...assignment.problems[existingProblemIndex],
          ...problemData,
          _id: assignment.problems[existingProblemIndex]._id // Ensure _id doesn't get overwritten
        };

      } else {
        throw new Error('Problem not found with provided _id');
      }
    } else {
      // Add new problem
      // Note: Mongoose will automatically generate _id
      assignment.problems.push(problemData as IProblem);
    }

    // Maintain order
    assignment.problems.sort((a: IProblem, b: IProblem) => a.orderIndex - b.orderIndex);


    const updatedAssignment = await assignment.save({ session });

    await session.commitTransaction();


    return updatedAssignment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const updateProblemReferenceSolutionQuery = async (
  assignmentId: Types.ObjectId,
  problemId: Types.ObjectId,
  referenceSolution: string
) => {
  await dbConnect();
  
  // Convert string IDs to ObjectIds if necessary

  const updatedAssignment = await Assignment.findOneAndUpdate(
    { 
      _id: assignmentId,
      'problems._id': problemId 
    },
    { 
      $set: { 
        'problems.$.referenceSolution': referenceSolution 
      } 
    },
    { new: true }
  );

  if (!updatedAssignment) {
    throw new Error('Assignment or problem not found');
  }

  return updatedAssignment;
};

/**
 * Deletes a problem from an assignment and updates related data.
 * Automatically reorders remaining problems and updates assignment totalPoints.
 * Currently does not delete related submissions.
 * 
 * @param assignmentId - The MongoDB ObjectId of the assignment
 * @param problemId - The MongoDB ObjectId of the problem to delete
 * @returns Promise containing the updated assignment document
 * @throws {Error} If assignment or problem is not found
 * 
 * @example
 * ```typescript
 * const updatedAssignment = await deleteProblemQuery(
 *   assignmentId,
 *   problemId
 * );
 * ```
 */
export const deleteProblemQuery = async (
  assignmentId: Types.ObjectId,
  problemId: Types.ObjectId
) => {
  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const assignment = await Assignment.findById(assignmentId).session(session);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Find the problem index
    const problemIndex = assignment.problems.findIndex(
      (p: IProblem & { _id: Types.ObjectId }) => p._id.toString() === problemId.toString()
    );

    if (problemIndex === -1) {
      throw new Error('Problem not found in assignment');
    }

    // Remove the problem
    assignment.problems.splice(problemIndex, 1);

    // Reorder remaining problems
    assignment.problems.forEach((problem: IProblem, index: number) => {
      problem.orderIndex = index;
    });

    // Update total points
    assignment.totalPoints = assignment.problems.reduce(
      (sum: number, problem: IProblem) => sum + problem.maxPoints,
      0
    );

    // // Delete all submissions for this problem
    // await Submission.deleteMany({
    //   assignmentId,
    //   problemId
    // }, { session });

    const updatedAssignment = await assignment.save({ session });
    await session.commitTransaction();
    return updatedAssignment;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Adds or updates a rubric item in a problem's rubric.
 * If rubric item has matching _id, updates that item.
 * If no _id provided or not found, adds as new item.
 * Automatically updates problem maxPoints and assignment totalPoints.
 * 
 * @param assignmentId - The MongoDB ObjectId of the assignment
 * @param problemId - The MongoDB ObjectId of the problem containing the rubric
 * @param rubricItemData - The rubric item data to add or update
 * @returns Promise containing the updated assignment document
 * @throws {Error} If assignment or problem is not found
 * 
 * @example
 * ```typescript
 * // Update existing rubric item
 * const updatedAssignment = await upsertRubricItemQuery(
 *   assignmentId,
 *   problemId,
 *   {
 *     _id: existingRubricItemId,
 *     description: "Updated criteria",
 *     points: 15
 *   }
 * );
 * 
 * // Add new rubric item
 * const newAssignment = await upsertRubricItemQuery(
 *   assignmentId,
 *   problemId,
 *   {
 *     description: "New criteria",
 *     points: 10
 *   }
 * );
 * ```
 */
export const upsertRubricItemQuery = async (
  assignmentId: Types.ObjectId,
  problemId: Types.ObjectId,
  rubricItemData: Partial<IRubricItem> & { _id?: Types.ObjectId }
) => {
  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find assignment and validate it exists
    const assignment = await Assignment.findById(assignmentId).session(session);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Find the specific problem
    const problem = assignment.problems.id(problemId);
    if (!problem) {
      throw new Error('Problem not found in assignment');
    }


    if (rubricItemData._id) {
      // Update existing rubric item
      const existingItemIndex = problem.rubric.items.findIndex(
        (item: IRubricItem & { _id: Types.ObjectId }) => item._id.toString() === rubricItemData._id!.toString()
      );

      if (existingItemIndex >= 0) {
        // Merge existing item with new data
        problem.rubric.items[existingItemIndex] = {
          ...problem.rubric.items[existingItemIndex],
          ...rubricItemData,
          _id: problem.rubric.items[existingItemIndex]._id // Preserve _id
        };
      } else {
        throw new Error('Rubric item not found with provided _id');
      }
    } else {

      // Create new rubric item object
      const newRubricItem: IRubricItem = {
        description: rubricItemData.description!,
        points: rubricItemData.points!
      };

      // Add to rubric items array
      problem.rubric.items.push(newRubricItem);
    }

    const updatedAssignment = await assignment.save({ session });
    await session.commitTransaction();
    return updatedAssignment;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


/**
 * Deletes a rubric item from a problem and updates points calculations.
 * 
 * @param assignmentId - The MongoDB ObjectId of the assignment
 * @param problemId - The MongoDB ObjectId of the problem containing the rubric
 * @param rubricItemId - The Mongoose-generated _id of the rubric item to delete
 * @returns Promise containing the updated assignment document
 * @throws {Error} If assignment, problem, or rubric item is not found
 * 
 * @example
 * ```typescript
 * const updatedAssignment = await deleteRubricItemQuery(
 *   assignmentId,
 *   problemId,
 *   rubricItemId
 * );
 * ```
 */
export const deleteRubricItemQuery = async (
  assignmentId: Types.ObjectId,
  problemId: Types.ObjectId,
  rubricItemId: Types.ObjectId
) => {
  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const assignment = await Assignment.findById(assignmentId).session(session);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const problem = assignment.problems.id(problemId);
    if (!problem) {
      throw new Error('Problem not found in assignment');
    }

    if (!problem.rubric?.items) {
      throw new Error('No rubric items found for this problem');
    }

    // Find the rubric item index
    const itemIndex = problem.rubric.items.findIndex(
      (item: IRubricItem & { _id: Types.ObjectId }) => item._id.toString() === rubricItemId.toString()
    );

    if (itemIndex === -1) {
      throw new Error('Rubric item not found in problem');
    }

    // Remove the rubric item
    problem.rubric.items.splice(itemIndex, 1);


    const updatedAssignment = await assignment.save({ session });
    await session.commitTransaction();
    return updatedAssignment;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

