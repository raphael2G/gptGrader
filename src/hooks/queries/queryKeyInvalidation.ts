import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

export function useInvalidateSubmissions() {
  const queryClient = useQueryClient();
  
  return (params: {
    assignmentId: string;
    problemId: string;
    submissionId?: string;
  }) => {

    // invalidate the lists
    if (params.assignmentId && params.problemId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissionKeys.lists.byAssignment(params.assignmentId)
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissionKeys.lists.byProblem(params.problemId)
      });
    }

    if (params.submissionId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissionKeys.item(params.submissionId)
      });
    } else {
      // if it is a bulk update (no submissionId) then we don't know what to reset. just do it all
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissionKeys.root
      })
    }

    return;
  };
}


export function useInvalidateRubric() {
  const queryClient = useQueryClient();

  return (params: { courseId: string, assignmentId: string, problemId: string }) => {

    // invalidate the assignment
    queryClient.invalidateQueries({
      queryKey: queryKeys.assignmentKeys.item(params.assignmentId)
    });

    // invalidate the course list
    queryClient.invalidateQueries({
      queryKey: queryKeys.assignmentKeys.lists.byCourse(params.courseId)
    });
  };
}
