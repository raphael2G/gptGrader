import { assignments, getAssignmentsByCourseId, getAssignmentById, updateAssignment, addProblemToAssignment, updateProblem, addRubricItemToProblem, updateRubricItem } from '../fakeDatabase/assignments'
import { getSubmissionsByAssignmentId } from '../fakeDatabase/submissions'
import { IAssignment, IProblem, IRubricItem } from '@/models/Assignment'
import { simulateApiDelay } from '../utils/apiDelay'

interface ApiError {
  error: string
  details?: string
}

interface AssignmentApiResponse {
  data: IAssignment | null
  error?: ApiError
}

interface AssignmentsApiResponse {
  data: IAssignment[]
  error?: ApiError
}

// Remove this interface
// interface AssignmentWithSubmissionInfo extends IAssignment {
//   uniqueSubmissions: number
//   gradingStatus: 'not-started' | 'in-progress' | 'completed'
// }

// Update this interface
interface AssignmentsWithSubmissionInfoResponse {
  data: (IAssignment & { uniqueSubmissions: number })[]
  error?: ApiError
}

export const assignmentApi = {
  getAssignmentsByCourseId: async (courseId: string): Promise<AssignmentsApiResponse> => {
    await simulateApiDelay();
    try {
      const courseAssignments = getAssignmentsByCourseId(courseId)
      return { data: courseAssignments }
    } catch (err) {
      return {
        data: [],
        error: { error: 'Failed to fetch course assignments' }
      }
    }
  },

  getAssignmentById: async (assignmentId: string): Promise<AssignmentApiResponse> => {
    await simulateApiDelay();
    try {
      const assignment = getAssignmentById(assignmentId)
      if (assignment) {
        return { data: assignment }
      } else {
        return { data: null, error: { error: 'Assignment not found' } }
      }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to fetch assignment' }
      }
    }
  },

  createAssignment: async (
    courseId: string,
    assignmentData: Omit<IAssignment, '_id' | 'courseId' | 'createdAt' | 'updatedAt'>
  ): Promise<AssignmentApiResponse> => {
    await simulateApiDelay();
    try {
      const newAssignment: IAssignment = {
        _id: `assignment${assignments.length + 1}`,
        courseId,
        ...assignmentData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      assignments.push(newAssignment)
      return { data: newAssignment }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to create assignment' }
      }
    }
  },

  updateAssignment: async (assignmentId: string, updateData: Partial<IAssignment>): Promise<AssignmentApiResponse> => {
    await simulateApiDelay();
    try {
      const updatedAssignment = updateAssignment(assignmentId, updateData)
      if (updatedAssignment) {
        return { data: updatedAssignment }
      } else {
        return { data: null, error: { error: 'Assignment not found' } }
      }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to update assignment' }
      }
    }
  },

  addProblemToAssignment: async (assignmentId: string, problem: IProblem): Promise<AssignmentApiResponse> => {
    await simulateApiDelay();
    try {
      const newProblem: IProblem = {
        ...problem,
        rubricFinalized: false, // Set default value to false
      }
      const updatedAssignment = addProblemToAssignment(assignmentId, newProblem)
      if (updatedAssignment) {
        return { data: updatedAssignment }
      } else {
        return { data: null, error: { error: 'Assignment not found' } }
      }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to add problem to assignment' }
      }
    }
  },

  updateProblem: async (assignmentId: string, problemId: string, updatedProblem: Partial<IProblem>): Promise<AssignmentApiResponse> => {
    await simulateApiDelay();
    try {
      const updatedAssignment = updateProblem(assignmentId, problemId, updatedProblem)
      if (updatedAssignment) {
        return { data: updatedAssignment }
      } else {
        return { data: null, error: { error: 'Assignment or problem not found' } }
      }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to update problem' }
      }
    }
  },

  addRubricItemToProblem: async (assignmentId: string, problemId: string, rubricItem: IRubricItem): Promise<AssignmentApiResponse> => {
    await simulateApiDelay();
    try {
      const updatedAssignment = addRubricItemToProblem(assignmentId, problemId, rubricItem)
      if (updatedAssignment) {
        return { data: updatedAssignment }
      } else {
        return { data: null, error: { error: 'Assignment or problem not found' } }
      }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to add rubric item to problem' }
      }
    }
  },

  updateRubricItem: async (assignmentId: string, problemId: string, rubricItemId: string, updatedRubricItem: Partial<IRubricItem>): Promise<AssignmentApiResponse> => {
    await simulateApiDelay();
    try {
      const updatedAssignment = updateRubricItem(assignmentId, problemId, rubricItemId, updatedRubricItem)
      if (updatedAssignment) {
        return { data: updatedAssignment }
      } else {
        return { data: null, error: { error: 'Assignment, problem, or rubric item not found' } }
      }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to update rubric item' }
      }
    }
  },

  deleteAssignment: async (assignmentId: string): Promise<{ success: boolean; error?: string }> => {
    await simulateApiDelay();
    try {
      const assignmentIndex = assignments.findIndex(a => a._id === assignmentId)
      if (assignmentIndex !== -1) {
        assignments.splice(assignmentIndex, 1)
        return { success: true }
      } else {
        return { success: false, error: 'Assignment not found' }
      }
    } catch (err) {
      return { success: false, error: 'Failed to delete assignment' }
    }
  },

  getAssignmentsNeedingGrading: async (courseId: string): Promise<AssignmentsApiResponse> => {
    await simulateApiDelay();
    try {
      const allAssignments = getAssignmentsByCourseId(courseId);
      const assignmentsNeedingGrading = allAssignments.filter(assignment => {
        const submissionsClosed = new Date(assignment.finalSubmissionDeadline) < new Date();
        return submissionsClosed && assignment.gradingStatus !== 'completed';
      });
      return { data: assignmentsNeedingGrading };
    } catch (err) {
      return {
        data: [],
        error: { error: 'Failed to fetch assignments needing grading' }
      };
    }
  },
  updateAssignmentStatus: async (assignmentId: string, newStatus: IAssignment['status']): Promise<AssignmentApiResponse> => {
    await simulateApiDelay();
    try {
      const updatedAssignment = updateAssignment(assignmentId, { status: newStatus });
      if (updatedAssignment) {
        return { data: updatedAssignment };
      } else {
        return { data: null, error: { error: 'Assignment not found' } };
      }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to update assignment status' }
      };
    }
  },

  getClosedAssignmentsWithSubmissionInfo: async (courseId: string): Promise<AssignmentsWithSubmissionInfoResponse> => {
    await simulateApiDelay();
    try {
      const allAssignments = getAssignmentsByCourseId(courseId);
      const closedAssignments = allAssignments.filter(assignment => assignment.status === 'closed');
    
      const assignmentsWithInfo = await Promise.all(closedAssignments.map(async (assignment) => {
        const submissions = await getSubmissionsByAssignmentId(assignment._id);
        const uniqueStudents = new Set(submissions.map(sub => sub.studentId));
      
        return {
          ...assignment,
          uniqueSubmissions: uniqueStudents.size
        };
      }));

      return { data: assignmentsWithInfo };
    } catch (err) {
      return {
        data: [],
        error: { error: 'Failed to fetch closed assignments with submission info' }
      };
    }
  },
  updateProblemRubricFinalization: async (assignmentId: string, problemId: string, isFinalized: boolean): Promise<AssignmentApiResponse> => {
    await simulateApiDelay();
    try {
      const updatedAssignment = updateProblem(assignmentId, problemId, { rubricFinalized: isFinalized })
      if (updatedAssignment) {
        return { data: updatedAssignment }
      } else {
        return { data: null, error: { error: 'Assignment or problem not found' } }
      }
    } catch (err) {
      return {
        data: null,
        error: { error: 'Failed to update rubric finalization status' }
      }
    }
  },
  getAllAssignmentsWithSubmissionInfo: async (courseId: string): Promise<AssignmentsWithSubmissionInfoResponse> => {
  await simulateApiDelay();
  try {
    const allAssignments = getAssignmentsByCourseId(courseId);
    
    const assignmentsWithInfo = await Promise.all(allAssignments.map(async (assignment) => {
      const submissions = await getSubmissionsByAssignmentId(assignment._id);
      const uniqueStudents = new Set(submissions.map(sub => sub.studentId));
    
      return {
        ...assignment,
        uniqueSubmissions: uniqueStudents.size
      };
    }));

    return { data: assignmentsWithInfo };
  } catch (err) {
    return {
      data: [],
      error: { error: 'Failed to fetch assignments with submission info' }
    };
  }
},
updateProblemReferenceSolution: async (assignmentId: string, problemId: string, referenceSolution: string): Promise<AssignmentApiResponse> => {
  await simulateApiDelay();
  try {
    const updatedAssignment = updateProblem(assignmentId, problemId, { referenceSolution })
    if (updatedAssignment) {
      return { data: updatedAssignment }
    } else {
      return { data: null, error: { error: 'Assignment or problem not found' } }
    }
  } catch (err) {
    return {
      data: null,
      error: { error: 'Failed to update reference solution' }
    }
  }
},
}

export default assignmentApi;

