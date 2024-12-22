'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, Check, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { IProblem } from '@@/models/Assignment'
import { ISubmission } from '@@/models/Submission'
import { submissionApi } from '@/app/lib/client-api/submissions'
import { useToast } from "@/components/ui/use-toast"

interface ProblemNavigationProps {
  problems: IProblem[];
  currentProblemId: string;
  assignmentId: string;
  studentId: string;
  onProblemClick: (problemId: string) => void;
}

export function ProblemNavigation({ problems, currentProblemId, assignmentId, studentId, onProblemClick }: ProblemNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const response = await submissionApi.getSubmissionsByAssignmentAndStudent(assignmentId, studentId);
        if (response.data) {
          setSubmissions(response.data);
        } else {
          throw new Error(response.error?.error || 'Failed to fetch submissions');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch submissions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignmentId, studentId, toast]);

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
          {problems.map((problem) => {
            const isCurrent = problem.id === currentProblemId;
            const hasSubmission = submissions.some(s => s.problemId === problem.id);

            return (
              <Button
                key={problem.id}
                variant="ghost"
                className={cn(
                  "w-full p-1 flex items-center justify-center",
                  isCurrent && "bg-accent text-accent-foreground"
                )}
                onClick={() => onProblemClick(problem.id)}
              >
                <span>Q{problems.findIndex(p => p.id === problem.id) + 1}</span>
                {isExpanded && !loading && (
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

