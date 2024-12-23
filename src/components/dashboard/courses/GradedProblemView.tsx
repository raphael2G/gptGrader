import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, X, Circle } from 'lucide-react';
import { assignmentApi } from '@/app/lib/client-api/assignments';
import { submissionApi } from '@/app/lib/client-api/submissions';
import { IAssignment, IProblem } from '@@/models/Assignment';
import { ISubmission } from '@@/models/Submission';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ProblemNavigation } from './ProblemNavigation';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CombinedRubricSection } from '@/components/rubrics/CombinedRubricSection';
import { SelfGradingRubric } from '@/components/rubrics/SelfGradingRubric'

interface GradedProblemViewProps {
  courseId: string;
  assignmentId: string;
  problemId: string;
}

export function GradedProblemView({ courseId, assignmentId, problemId }: GradedProblemViewProps) {
  const [assignment, setAssignment] = useState<IAssignment | null>(null);
  const [problem, setProblem] = useState<IProblem | null>(null);
  const [submission, setSubmission] = useState<ISubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [selfGradeSelections, setSelfGradeSelections] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const studentId = '1';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [assignmentResponse, submissionResponse] = await Promise.all([
          assignmentApi.getAssignmentById(assignmentId),
          submissionApi.getSubmissionByAssignmentProblemAndStudent(assignmentId, problemId, studentId)
        ]);

        if (assignmentResponse.data) {
          setAssignment(assignmentResponse.data);
          const foundProblem = assignmentResponse.data.problems.find(p => p.id === problemId);
          if (foundProblem) {
            setProblem(foundProblem);
          }
        }

        if (submissionResponse.data) {
          setSubmission(submissionResponse.data);
          setSelfGradeSelections(submissionResponse.data.selfAssessedRubricItems?.map(item => item.rubricItemId) || []);
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

  const handleProblemNavigation = (newProblemId: string) => {
    router.push(`/courses/${courseId}/assignments/${assignmentId}/${newProblemId}`);
  };

  const toggleRubricItem = (itemId: string) => {
    if (submission?.selfGraded) return;
    setSelfGradeSelections(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const calculatePoints = (selectedItems: string[]) => {
    if (!problem) return 0;
    return problem.rubric.reduce((total, item) => 
      total + (selectedItems.includes(item.id) ? item.points : 0), 0
    );
  };

  const handleSubmitSelfGrade = async () => {
    if (!submission || !problem) return;

    try {
      const updateData = {
        selfGraded: true,
        selfGradingStatus: 'completed',
        selfGradingCompletedAt: new Date(),
        selfAssessedRubricItems: problem.rubric
          .filter(item => selfGradeSelections.includes(item.id))
          .map(item => ({
            rubricItemId: item.id,
            comment: '',
          })),
      };

      const response = await submissionApi.updateSubmission(submission._id!, updateData);

      if (response.data) {
        setSubmission(response.data);
        toast({
          title: 'Self Grade Submitted',
          description: 'Your self-grade has been submitted.',
        });
      } else {
        throw new Error(response.error?.error || 'Failed to submit self-grade');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSelfGradingComplete = (updatedSubmission: ISubmission) => {
    setSubmission(updatedSubmission);
    toast({
      title: 'Success',
      description: 'Self-grading submitted successfully.',
    });
  };


  if (loading || !assignment || !problem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const gradedPoints = calculatePoints(submission?.appliedRubricItemIds || []);
  const selfGradedPoints = calculatePoints(selfGradeSelections);

  const RubricSection = ({ 
    selections, 
    isEditable = false, 
    title = "Rubric",
    showSubmit = false 
  }) => (
    <Card className="w-1/3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {problem.rubric.map((item) => {
            const isSelected = selections.includes(item.id);
            const isPositive = item.points >= 0;

            return (
              <motion.div
                key={item.id}
                onClick={() => isEditable && toggleRubricItem(item.id)}
                className={cn(
                  "flex items-center p-4 rounded-md transition-colors",
                  isEditable && "cursor-pointer",
                  isSelected && isPositive && "bg-green-100 dark:bg-green-900/30 border-2 border-green-500",
                  isSelected && !isPositive && "bg-red-100 dark:bg-red-900/30 border-2 border-red-500",
                  !isSelected && "bg-muted hover:bg-muted/80 dark:hover:bg-muted/50"
                )}
                whileHover={isEditable ? { scale: 1.02 } : {}}
                whileTap={isEditable ? { scale: 0.98 } : {}}
              >
                <span className="flex-grow text-sm">
                  {item.description}
                </span>
                <span className={cn(
                  "font-semibold text-sm",
                  isPositive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                )}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </span>
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="text-lg font-semibold flex justify-between items-center">
            <span>Total Score:</span>
            <span>{calculatePoints(selections)} / {problem.maxPoints}</span>
          </div>
        </div>

        {showSubmit && (
          <Button 
            className="w-full mt-4" 
            onClick={handleSubmitSelfGrade}
          >
            Submit Self-Grade
          </Button>
        )}
      </CardContent>
    </Card>
  );



  return (
    <div className="flex gap-6">
      <ProblemNavigation
        problems={assignment.problems}
        currentProblemId={problemId}
        assignmentId={assignmentId}
        studentId={studentId}
        onProblemClick={handleProblemNavigation}
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
                Problem {assignment.problems.findIndex(p => p.id === problem.id) + 1}
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
                studentId={studentId}
              />
            ) : (
              <SelfGradingRubric
                problem={problem}
                submission={submission}
                onSelfGradingComplete={handleSelfGradingComplete}
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

