import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from 'next/navigation';
import { useGetAssignmentById } from '@/hooks/queries/useAssignments';
import { useGetSubmissionsByStudentIdAndAssignmentId } from '@/hooks/queries/useSubmissions';

interface ProblemNavigationProps {
  assignmentId: string;
  studentId: string;
}

export function ProblemNavigation({ assignmentId, studentId }: ProblemNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const params = useParams();
  
  // Extract current problem ID from URL
  const currentProblemId = params.problemId as string;

  // Extract courseId from URL
  const courseId = params.courseId as string;

  // Fetch assignment to get problems
  const { data: assignment, isLoading: isLoadingAssignment } = useGetAssignmentById(assignmentId);

  // Fetch submissions for the assignment
  const { data: submissions, isLoading: isLoadingSubmissions } = useGetSubmissionsByStudentIdAndAssignmentId(
    studentId,
    assignmentId
  );

  const handleProblemClick = (newProblemId: string) => {
    router.push(`/courses/${courseId}/assignments/${assignmentId}/${newProblemId}`);
  };

  if (isLoadingAssignment) {
    return (
      <div className="border rounded-lg shadow-sm w-12 h-full flex items-center justify-center">
        <div className="animate-pulse w-4 h-4 rounded-full bg-gray-200" />
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  return (
    <div className={cn(
      "border rounded-lg shadow-sm transition-all duration-300 ease-in-out overflow-hidden flex flex-col w-12",
      isExpanded && "w-32"
    )}>
      <Button
        variant="ghost"
        className="w-full flex justify-center items-center p-2"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? "Collapse problem list" : "Expand problem list"}
      >
        {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
      <ScrollArea className="flex-grow">
        <div className="p-2 space-y-1">
          {assignment.problems.map((problem, index) => {
            const isCurrent = problem._id?.toString() === currentProblemId;
            const hasSubmission = submissions?.some(s => 
              s.problemId.toString() === problem._id?.toString()
            );

            return (
              <Button
                key={problem._id?.toString()}
                variant="ghost"
                className={cn(
                  "w-full p-1 flex items-center justify-center",
                  isCurrent && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleProblemClick(problem._id?.toString() || '')}
              >
                <span>Q{index + 1}</span>
                {isExpanded && !isLoadingSubmissions && (
                  hasSubmission ? (
                    <Check className="ml-2 h-4 w-4 text-green-500" />
                  ) : (
                    <X className="ml-2 h-4 w-4 text-red-500" />
                  )
                )}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}