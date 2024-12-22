'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { assignmentApi } from '@/app/lib/client-api/assignments';
import { submissionApi } from '@/app/lib/client-api/submissions';
import { IAssignment, IProblem } from '@@/models/Assignment';
import { ISubmission } from '@@/models/Submission';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import Link from 'next/link';
import { ProblemNavigation } from './ProblemNavigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProblemViewProps {
  courseId: string;
  assignmentId: string;
  problemId: string;
}

export function ProblemView({ courseId, assignmentId, problemId }: ProblemViewProps) {
  const [assignment, setAssignment] = useState<IAssignment | null>(null);
  const [problem, setProblem] = useState<IProblem | null>(null);
  const [submission, setSubmission] = useState<ISubmission | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastSubmissionDialogOpen, setLastSubmissionDialogOpen] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<ISubmission | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Placeholder for the actual student ID
  const studentId = '1';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const assignmentResponse = await assignmentApi.getAssignmentById(assignmentId);
        if (!assignmentResponse.data) {
          throw new Error('Assignment not found');
        }
        setAssignment(assignmentResponse.data);
        console.log(assignmentResponse)

        const foundProblem = assignmentResponse.data.problems.find(p => p.id === 'problem1');
        if (!foundProblem) {
          throw new Error('Problem not found');
        }
        setProblem(foundProblem);

        const submissionResponse = await submissionApi.getSubmissionByAssignmentProblemAndStudent(
          assignmentId,
          problemId,
          studentId
        );
        setSubmission(submissionResponse.data);

        if (submissionResponse.data) {
          setAnswer(submissionResponse.data.answer);
          setLastSubmission(submissionResponse.data);
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentId, problemId, toast]);

  const handleSubmit = async () => {
    try {
      if (!submission) {
        const newSubmission = await submissionApi.createSubmission(assignmentId, studentId, [{ problemId, answer }]);
        if (newSubmission.data) {
          setSubmission(newSubmission.data);
          toast({
            title: 'Submission Created',
            description: 'Your submission has been created.',
          });
        } else {
          throw new Error('Failed to create submission');
        }
      } else {
        const updatedSubmission = await submissionApi.updateSubmission(submission._id!, { answer });
        if (updatedSubmission.data) {
          setSubmission(updatedSubmission.data);
          toast({
            title: 'Submission Updated',
            description: 'Your submission has been updated.',
          });
        } else {
          throw new Error('Failed to update submission');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleProblemNavigation = (newProblemId: string) => {
    router.push(`/courses/${courseId}/assignments/${assignmentId}/${newProblemId}`);
  };

  if (loading || !assignment || !problem) {

    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentDate = new Date();
  const dueDate = new Date(assignment.dueDate);
  const isPastDue = currentDate > dueDate;

  let status: string;
  let statusColor: string;

  if (currentDate < dueDate) {
    status = "Accepting Submissions";
    statusColor = 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200';
  } else if (currentDate >= dueDate && !assignment.areGradesReleased) {
    status = "Not Graded";
    statusColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200';
  } else if (assignment.areGradesReleased) {
    if (assignment.selfGradingEnabled && !submission?.selfGraded) {
      status = "Need Self Grade";
      statusColor = 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200';
    } else {
      status = "Graded";
      statusColor = 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-200';
    }
  }

  return (
    <div className="flex gap-6">
      <ProblemNavigation
        problems={assignment.problems}
        currentProblemId={problemId}
        assignmentId={assignmentId}
        studentId={studentId}
        onProblemClick={handleProblemNavigation}
      />
      <div className="flex-grow space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
          <p className="text-xl">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
          <p className="text-lg">{assignment.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Problem {assignment.problems.findIndex(p => p.id === problem.id) + 1}
            </CardTitle>
            <div className="flex gap-2">
              <Badge className={statusColor}>{status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold mb-4">{problem.question}</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={isPastDue ? 'cursor-not-allowed' : ''}>
                    <Textarea
                      placeholder={isPastDue ? "Submission closed" : "Enter your answer here..."}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className={`w-full min-h-[200px] border-2 border-gray-200 dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isPastDue ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
                      }`}
                      disabled={isPastDue}
                    />
                  </div>
                </TooltipTrigger>
                {isPastDue && (
                  <TooltipContent>
                    <p>It is past the due date. Submissions are closed.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </CardContent>
          <CardContent className="pt-0">
            <div className="flex justify-center items-center space-x-4 mt-2">
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setLastSubmissionDialogOpen(true);
                }}
                className="text-sm text-muted-foreground hover:underline focus:underline"
              >
                View Last Submission
              </Link>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button onClick={handleSubmit} disabled={isPastDue}>
                        {isPastDue ? "Submission Closed" : "Submit"}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {isPastDue && (
                    <TooltipContent>
                      <p>It is past the due date. Submissions are closed.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        <Dialog open={lastSubmissionDialogOpen} onOpenChange={setLastSubmissionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Last Submission</DialogTitle>
              {lastSubmission && (
                <DialogDescription>
                  Submitted at: {new Date(lastSubmission.submittedAt).toLocaleString()}
                </DialogDescription>
              )}
            </DialogHeader>
            <Textarea
              value={lastSubmission?.answer || 'No previous submission found.'}
              readOnly
              className="w-full h-64 mt-4"
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

