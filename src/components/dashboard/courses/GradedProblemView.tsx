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

  const CombinedRubricSection = ({
    studentSelections,
    instructorSelections,
  }: {
    studentSelections: string[];
    instructorSelections: string[];
  }) => {
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<"student" | "instructor" | null>(null);
    const [comment, setComment] = useState("");

    const handleRubricItemClick = (itemId: string) => {
      setExpandedItemId(prevId => prevId === itemId ? null : itemId);
      setSelectedOption(null); 
      setComment(""); 
    };

    const handleSubmit = () => {
      if (!selectedOption || !comment) {
        toast({
          description: "Please select an option and provide a comment.",
          variant: "destructive",
        });
        return;
      }

      alert(`Submitting feedback for rubric item ${expandedItemId}: Option - ${selectedOption}, Comment - ${comment}`);

      setExpandedItemId(null);
      setSelectedOption(null);
      setComment("");
    };

    return (
      <Card className="w-1/3">
        <CardHeader>
          <CardTitle>Grading Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {problem.rubric.map((item) => {
              const studentSelected = studentSelections.includes(item.id);
              const instructorSelected = instructorSelections.includes(item.id);
              const isPositive = item.points >= 0;
              const bothSelected = studentSelected && instructorSelected;
              const onlyStudentSelected = studentSelected && !instructorSelected;
              const onlyInstructorSelected = !studentSelected && instructorSelected;

              let studentIcon = <Circle className="h-5 w-5 text-gray-400" />;
              if (studentSelected && isPositive) {
                studentIcon = <Check className="h-5 w-5 text-green-500" />;
              } else if (studentSelected && !isPositive) {
                studentIcon = <X className="h-5 w-5 text-red-500" />;
              }

              let instructorIcon = <Circle className="h-5 w-5 text-gray-400" />;
              if (instructorSelected && isPositive) {
                instructorIcon = <Check className="h-5 w-5 text-green-500" />;
              } else if (instructorSelected && !isPositive) {
                instructorIcon = <X className="h-5 w-5 text-red-500" />;
              }

              let bgColor = "bg-muted";
              if (bothSelected) {
                bgColor = isPositive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30";
              } else if (onlyStudentSelected) {
                bgColor = isPositive ? "bg-gradient-to-r from-green-100 via-gray-100 to-gray-100 dark:from-green-900/30 dark:via-gray-800 dark:to-gray-800" : "bg-gradient-to-r from-red-100 via-gray-100 to-gray-100 dark:from-red-900/30 dark:via-gray-800 dark:to-gray-800";
              } else if (onlyInstructorSelected) {
                bgColor = isPositive ? "bg-gradient-to-l from-green-100 via-gray-100 to-gray-100 dark:from-green-900/30 dark:via-gray-800 dark:to-gray-800" : "bg-gradient-to-l from-red-100 via-gray-100 to-gray-100 dark:from-red-900/30 dark:via-gray-800 dark:to-gray-800";
              }

              // Add cursor pointer and hover effect for disputed items only
              const isDisputed = studentSelected !== instructorSelected;
              const cursorClass = isDisputed ? "cursor-pointer" : "";
              const hoverEffect = isDisputed ? "hover:bg-muted/80 dark:hover:bg-muted/50" : "";

              return (
                <div key={item.id}>
                  <motion.div
                    onClick={isDisputed ? () => handleRubricItemClick(item.id) : undefined}
                    className={`relative flex items-center p-4 rounded-md border border-gray-200 dark:border-gray-700 ${bgColor} ${cursorClass} ${hoverEffect}`}
                    whileHover={isDisputed ? { scale: 1.02 } : {}}
                    whileTap={isDisputed ? { scale: 0.98 } : {}}
                  >
                    <div className="w-1/2 pr-2">
                      {studentIcon}
                    </div>
                    <div className="flex-grow">
                      <span className="text-sm">{item.description}</span>
                      <span className={cn(
                        "font-semibold text-sm ml-2",
                        isPositive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                      )}>
                        ({item.points > 0 ? '+' : ''}{item.points})
                      </span>
                    </div>
                    <div className="w-1/2 pl-2 text-right">
                      {instructorIcon}
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {expandedItemId === item.id && (
                      <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-muted rounded-md mt-2 space-y-2 border border-gray-200 dark:border-gray-700"
                      >
                        <RadioGroup
                          onValueChange={value => setSelectedOption(value as "student" | "instructor")}
                          value={selectedOption}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="student" id={`student-${item.id}`} />
                            <Label htmlFor={`student-${item.id}`}>I am wrong (student)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="instructor" id={`instructor-${item.id}`} />
                            <Label htmlFor={`instructor-${item.id}`}>The initial grade is wrong (instructor)</Label>
                          </div>
                        </RadioGroup>
                        <Textarea
                          placeholder="Enter your comment here..."
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          className="w-full resize-none border-2 focus:ring-2 focus:ring-primary dark:bg-black"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setExpandedItemId(null)}>Cancel</Button>
                          <Button onClick={handleSubmit}>Submit</Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
            <div className="text-sm flex justify-between items-center">
              <span>Your Self-Grade:</span>
              <span>{calculatePoints(studentSelections)} / {problem.maxPoints}</span>
            </div>
            <div className="text-sm flex justify-between items-center">
              <span>Instructor's Grade:</span>
              <span>{calculatePoints(instructorSelections)} / {problem.maxPoints}</span>
            </div>
          </div> */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Your Grade</div>
                <div className="text-xl font-semibold">
                  {calculatePoints(studentSelections)}
                </div>
              </div>
              <div className="border-x border-border px-4">
                <div className="text-sm text-muted-foreground mb-1">Total Points</div>
                <div className="text-xl font-semibold">
                  {problem.maxPoints}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Instructor Grade</div>
                <div className="text-xl font-semibold">
                  {calculatePoints(instructorSelections)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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

          {submission?.selfGraded ? (
            <CombinedRubricSection 
              studentSelections={submission.selfAssessedRubricItems?.map(i => i.rubricItemId) || []}
              instructorSelections={submission.appliedRubricItemIds}
            />
          ) : (
            <RubricSection
              selections={selfGradeSelections}
              isEditable={true}
              showSubmit={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}

