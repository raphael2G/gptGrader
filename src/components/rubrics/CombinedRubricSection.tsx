'use client';

import { useState, useEffect } from 'react';
import { Check, X, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { submissionApi } from '@/app/lib/client-api/submissions';
import { discrepancyReportApi } from '@/app/lib/client-api/discrepancyReports';
import { assignmentApi } from '@/app/lib/client-api/assignments';
import { IProblem, IRubricItem } from '@@/models/Assignment';
import { ISubmission } from '@@/models/Submission';
import { IDiscrepancyReport, IDiscrepancyItem } from '@@/models/DiscrepancyReport';
import { cn } from "@/lib/utils";

interface CombinedRubricSectionProps {
  assignmentId: string;
  problemId: string;
  studentId: string;
}

export function CombinedRubricSection({ assignmentId, problemId, studentId }: CombinedRubricSectionProps) {
  const [problem, setProblem] = useState<IProblem | null>(null);
  const [submission, setSubmission] = useState<ISubmission | null>(null);
  const [discrepancyReport, setDiscrepancyReport] = useState<IDiscrepancyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<"student" | "instructor" | null>(null);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [assignmentResponse, submissionResponse] = await Promise.all([
          assignmentApi.getAssignmentById(assignmentId),
          submissionApi.getSubmissionByAssignmentProblemAndStudent(assignmentId, problemId, studentId)
        ]);

        if (assignmentResponse.data && submissionResponse.data) {
          const foundProblem = assignmentResponse.data.problems.find(p => p.id === problemId);
          setProblem(foundProblem || null);
          setSubmission(submissionResponse.data);

          const discrepancyResponse = await discrepancyReportApi.getDiscrepancyReportsBySubmission(submissionResponse.data._id!);
          if (discrepancyResponse.data && discrepancyResponse.data.length > 0) {
            setDiscrepancyReport(discrepancyResponse.data[0]);
          }
        } else {
          throw new Error('Failed to fetch problem or submission data');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentId, problemId, studentId, toast]);

  if (loading || !problem || !submission) {
    return <div>Loading...</div>;
  }

  const studentSelections = submission.selfAssessedRubricItems?.map(i => i.rubricItemId) || [];
  const instructorSelections = submission.appliedRubricItemIds;

  const calculatePoints = (selectedItems: string[] | undefined) => {
    if (!problem || !selectedItems) return 0;
    return problem.rubric.reduce((total, item) =>
      total + (selectedItems.includes(item.id) ? item.points : 0), 0
    );
  };

  const handleRubricItemClick = (itemId: string) => {
    setExpandedItemId(prevId => prevId === itemId ? null : itemId);
    if (!discrepancyReport?.items.find(i => i.rubricItemId === itemId)) {
      setSelectedOption(null);
      setComment("");
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption || !comment || !expandedItemId || !submission) {
      toast({
        description: "Please select an option and provide a comment.",
        variant: "destructive",
      });
      return;
    }

    try {
      const discrepancyItem: IDiscrepancyItem = {
        submissionId: submission._id!,
        studentId: studentId,
        courseId: submission.courseId,
        assignmentId: assignmentId,
        problemId: problemId,
        rubricItemId: expandedItemId,
        wasApplied: instructorSelections.includes(expandedItemId),
        studentThinksShouldBeApplied: selectedOption === 'instructor',
        studentExplanation: comment,
      };

      const response = await discrepancyReportApi.createOrUpdateDiscrepancyReport(discrepancyItem);

      if (response.data) {
        setDiscrepancyReport(response.data);
        setExpandedItemId(null);
        setSelectedOption(null);
        setComment("");
        toast({
          title: "Success",
          description: "Discrepancy report submitted successfully.",
        });
      } else {
        throw new Error(response.error?.error || 'Failed to create discrepancy report');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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
            const discrepancyItem = discrepancyReport?.items.find(i => i.rubricItemId === item.id);
            const isResolved = discrepancyItem?.resolution !== undefined;
            const isDisputed = studentSelected !== instructorSelected;

            let studentIcon = studentSelected
              ? (isPositive ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />)
              : <Circle className="h-5 w-5 text-gray-400" />;

            let instructorIcon = instructorSelected
              ? (isPositive ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />)
              : <Circle className="h-5 w-5 text-gray-400" />;

            let bgColor = "bg-muted";
            if (isResolved) {
              bgColor = studentSelected === instructorSelected
                ? (isPositive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30")
                : "bg-gray-100 dark:bg-gray-800";
            } else if (studentSelected && instructorSelected) {
              bgColor = isPositive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30";
            } else if (studentSelected && !instructorSelected) {
              bgColor = isPositive ? "bg-gradient-to-r from-green-100 via-gray-100 to-gray-100 dark:from-green-900/30 dark:via-gray-800 dark:to-gray-800" : "bg-gradient-to-r from-red-100 via-gray-100 to-gray-100 dark:from-red-900/30 dark:via-gray-800 dark:to-gray-800";
            } else if (!studentSelected && instructorSelected) {
              bgColor = isPositive ? "bg-gradient-to-l from-green-100 via-gray-100 to-gray-100 dark:from-green-900/30 dark:via-gray-800 dark:to-gray-800" : "bg-gradient-to-l from-red-100 via-gray-100 to-gray-100 dark:from-red-900/30 dark:via-gray-800 dark:to-gray-800";
            }

            const cursorClass = isDisputed || discrepancyItem ? "cursor-pointer" : "";
            const hoverEffect = isDisputed || discrepancyItem ? "hover:bg-muted/80 dark:hover:bg-muted/50" : "";

            return (
              <div key={item.id}>
                <motion.div
                  onClick={isDisputed || discrepancyItem ? () => handleRubricItemClick(item.id) : undefined}
                  className={`relative flex items-center p-4 rounded-md border border-gray-200 dark:border-gray-700 ${bgColor} ${cursorClass} ${hoverEffect}`}
                  whileHover={isDisputed || discrepancyItem ? { scale: 1.02 } : {}}
                  whileTap={isDisputed || discrepancyItem ? { scale: 0.98 } : {}}
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
                  {(isDisputed || discrepancyItem) && (
                    <div className="ml-2">
                      {expandedItemId === item.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  )}
                  {discrepancyItem && (
                    <div className="absolute top-0 right-0 mt-1 mr-1">
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        isResolved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      )}>
                        {isResolved ? "Resolved" : "Pending"}
                      </Badge>
                    </div>
                  )}
                </motion.div>

                <AnimatePresence>
                  {expandedItemId === item.id && (isDisputed || discrepancyItem) && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-muted rounded-md mt-2 space-y-2 border border-gray-200 dark:border-gray-700"
                    >
                      {discrepancyItem ? (
                        <>
                          <h4 className="font-semibold mb-2">Discrepancy Report</h4>
                          <p className="mb-2"><strong>Student's Explanation:</strong> {discrepancyItem.studentExplanation}</p>
                          {discrepancyItem.resolution ? (
                            <>
                              <h5 className="font-semibold mt-4 mb-2">Professor's Resolution</h5>
                              <p><strong>Decision:</strong> {discrepancyItem.resolution.shouldBeApplied ? "Apply rubric item" : "Do not apply rubric item"}</p>
                              <p><strong>Explanation:</strong> {discrepancyItem.resolution.explanation}</p>
                              <p><strong>Discrepancy Type:</strong> {discrepancyItem.resolution.discrepancyType === 'student_error' ? 'Student Error' : 'Grading Error'}</p>
                            </>
                          ) : (
                            <p className="text-yellow-600 dark:text-yellow-400">This discrepancy is pending resolution.</p>
                          )}
                        </>
                      ) : isDisputed ? (
                        <>
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
                        </>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

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
}

