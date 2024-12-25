import { Types } from 'mongoose';
import { 
  getAssignmentByIdQuery,
  createAssignmentQuery, 
  updateAssignmentQuery, 
  deleteAssignmentQuery,
  upsertProblemQuery,
  deleteProblemQuery,
  upsertRubricItemQuery,
  deleteRubricItemQuery
} from '@/queries/assignmentQueries';
import { IAssignment, IProblem, IRubricItem } from '@/models/Assignment';



export async function getAssignmentById(assignmentId: Types.ObjectId) {
  try {
    const assignment = await getAssignmentByIdQuery(assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    return assignment;
  } catch (error) {
    throw new Error(`Failed to fetch assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a new assignment for a course
 */
export async function createAssignment(
  courseId: Types.ObjectId,
  assignmentData: Omit<IAssignment, '_id' | 'courseId' | 'createdAt' | 'updatedAt'>
) {
  try {
    const newAssignment = await createAssignmentQuery(courseId, assignmentData);
    return newAssignment;
  } catch (error) {
    throw new Error(`Failed to create assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Updates basic assignment details (not problems or rubrics)
 */
export async function updateAssignment(
  assignmentId: Types.ObjectId,
  updateData: Partial<Omit<IAssignment, '_id' | 'problems' | 'courseId' | 'createdAt' | 'updatedAt'>>
) {
  try {
    const updatedAssignment = await updateAssignmentQuery(assignmentId, updateData);
    return updatedAssignment;
  } catch (error) {
    throw new Error(`Failed to update assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deletes an assignment and all related submissions
 */
export async function deleteAssignment(assignmentId: Types.ObjectId) {
  try {
    const deletedAssignment = await deleteAssignmentQuery(assignmentId);
    return deletedAssignment;
  } catch (error) {
    throw new Error(`Failed to delete assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Adds a new problem to an assignment or updates an existing one
 */
export async function upsertProblem(
  assignmentId: Types.ObjectId,
  problemData: Partial<IProblem>
) {
  try {
    const updatedAssignment = await upsertProblemQuery(assignmentId, problemData);
    return updatedAssignment;
  } catch (error) {
    throw new Error(`Failed to upsert problem: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Removes a problem from an assignment
 */
export async function deleteProblem(
  assignmentId: Types.ObjectId,
  problemId: Types.ObjectId
) {
  try {
    const updatedAssignment = await deleteProblemQuery(assignmentId, problemId);
    return updatedAssignment;
  } catch (error) {
    throw new Error(`Failed to delete problem: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Adds a new rubric item to a problem or updates an existing one
 */
export async function upsertRubricItem(
  assignmentId: Types.ObjectId,
  problemId: Types.ObjectId,
  rubricItemData: Partial<IRubricItem>
) {
  try {
    const updatedAssignment = await upsertRubricItemQuery(
      assignmentId,
      problemId,
      rubricItemData
    );
    return updatedAssignment;
  } catch (error) {
    throw new Error(`Failed to upsert rubric item: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Removes a rubric item from a problem
 */
export async function deleteRubricItem(
  assignmentId: Types.ObjectId,
  problemId: Types.ObjectId,
  rubricItemId: Types.ObjectId
) {
  try {
    const updatedAssignment = await deleteRubricItemQuery(
      assignmentId,
      problemId,
      rubricItemId
    );
    return updatedAssignment;
  } catch (error) {
    throw new Error(`Failed to delete rubric item: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}