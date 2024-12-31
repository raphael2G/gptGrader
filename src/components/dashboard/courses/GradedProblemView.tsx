'use client'

import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ProblemNavigation } from './ProblemNavigation';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CombinedRubricSection } from '@/components/rubrics/CombinedRubricSection';
import { SelfGradingRubric } from '@/components/rubrics/SelfGradingRubric';
import { useGetAssignmentById } from '@/hooks/queries/useAssignments';
import { IAssignment } from '@/models/Assignment';
import { ISubmission } from '@/models/Submission';
import { UserAuth } from '@/contexts/AuthContext';
import { useGetSubmissionsByStudentIdAssignmentIdAndProblemId } from '@/hooks/queries/useSubmissions';



interface GradedProblemViewProps {
  courseId: string;
  assignmentId: string;
  problemId: string;
}

export function GradedProblemView({ courseId, assignmentId, problemId }: GradedProblemViewProps) {
  const { toast } = useToast();
  const router = useRouter();
  const user = UserAuth().user;

  // React Query hooks
  const {
    data: assignment,
    isLoading: assignmentLoading,
    error: assignmentError
  } = useGetAssignmentById(assignmentId);

  const {
    data: submission,
    isLoading: submissionLoading,
    error: submissionError
  } = useGetSubmissionsByStudentIdAssignmentIdAndProblemId(user?._id.toString() || '', assignmentId, problemId, {enabled: !!user}, );

  if (!user) {
    return <div>loading user...</div>
  }

  // Handle loading states
  if (assignmentLoading || submissionLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle errors
  if (assignmentError || submissionError) {
    return null;
  }

  // If no assignment or problem found
  if (!assignment) return null;
  const problem = assignment.problems.find(p => p._id.toString() === problemId);
  if (!problem) return null;
  if (!submission) return null;

  const handleProblemNavigation = (newProblemId: string) => {
    router.push(`/courses/${courseId}/assignments/${assignmentId}/${newProblemId}`);
  };



  return (
    <div className="flex gap-6">
      <ProblemNavigation
        assignmentId={assignmentId}
        studentId={user._id.toString()}
      />
      
      <div className="flex-grow space-y-6 w-2/3">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
          <p className="text-xl">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
          <p className="text-lg">{assignment.description}</p>
        </div>

        <div className="flex gap-6">
          <Card className="w-2/3">
            <CardHeader>
              <CardTitle>
                Problem {assignment.problems.findIndex(p => p._id.toString() === problemId) + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold mb-4">{problem.question}</p>
              <Textarea
                value={submission?.answer || 'No submission found.'}
                readOnly
                className="w-full min-h-[200px] border-2 border-gray-200 dark:border-gray-700 rounded-md p-2"
              />
            </CardContent>
          </Card>

          {submission ? (
            submission.selfGraded ? (
              <CombinedRubricSection
                assignmentId={assignmentId}
                problemId={problemId}
                studentId={user._id.toString()}
              />
            ) : (
              <SelfGradingRubric
                problem={problem}
                submission={submission}
              />
            )
          ) : (
            <Card className="w-1/3">
              <CardHeader>
                <CardTitle>Grading</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No submission available for grading.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}