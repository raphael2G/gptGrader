'use client';

import { useState, useEffect } from 'react'
import { Check, X, Circle } from 'lucide-react';
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
import { IProblem } from '@@/models/Assignment';
import { ISubmission } from '@@/models/Submission';
import { cn } from "@/lib/utils";

interface ProfessorDisputeReviewSectionProps {
  problem: IProblem;
  submission: ISubmission | null;
  studentId: string;
  onSubmissionUpdate: (updatedSubmission: ISubmission) => void;
}

interface StudentExplanation {
  rubricItemId: string;
  explanation: string;
}

export const ProfessorDisputeReviewSection: React.FC<ProfessorDisputeReviewSectionProps> = ({
  problem,
  submission,
  studentId,
  onSubmissionUpdate
}) => {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<"student" | "instructor" | null>(null);
  const [comment, setComment] = useState("");
  const [resolvedItems, setResolvedItems] = useState<Record<string, 'student' | 'instructor'>>({});
  const [studentExplanations, setStudentExplanations] = useState<StudentExplanation[]>([]);
  const { toast } = useToast();

  const studentSelections = submission?.selfAssessedRubricItems?.map(i => i.rubricItemId) || [];
  const instructorSelections = submission?.appliedRubricItemIds || [];

  console.log("ProfessorDisputeReviewSection rendered with submission:", submission);

  useEffect(() => {
    const fetchStudentExplanations = async () => {
      if (submission?._id) {
        try {
          console.log("Fetching explanations for submission:", submission._id);
          const response = await discrepancyReportApi.getDiscrepancyReportsBySubmission(submission._id);
          console.log("API response:", response);
          if (response.data) {
            setStudentExplanations(response.data.map(report => ({
              rubricItemId: report.rubricItemId,
              explanation: report.studentExplanation
            })));
          } else {
            console.error("No data in API response:", response);
          }
        } catch (error: any) {
          console.error("Failed to fetch student explanations:", error);
          console.error("Error details:", error.message, error.stack);
          toast({
            title: "Error",
            description: `Failed to fetch student explanations: ${error.message}`,
            variant: "destructive",
          });
        }
      } else {
        console.log("No submission ID available, skipping explanation fetch");
      }
    };

    fetchStudentExplanations();
  }, [submission?._id, toast]);

  const calculatePoints = (selectedItems: string[]) => {
    return problem.rubric.reduce((total, item) => 
      total + (selectedItems.includes(item.id) ? item.points : 0), 0
    );
  };

  const handleRubricItemClick = (itemId: string) => {
    setExpandedItemId(prevId => prevId === itemId ? null : itemId);
    setSelectedOption(null);
    setComment("");
  };

  const handleSubmit = async () => {
    if (!selectedOption || !comment || !expandedItemId || !submission) {
      alert("Please selection an option and provide a comment")
      toast({
        description: "Please select an option and provide a comment.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await discrepancyReportApi.resolveDiscrepancyReport(submission._id!, expandedItemId, {
        resolution: selectedOption,
        explanation: comment,
      });

      if (response.data) {
        const updatedSubmission = await submissionApi.updateSubmission(submission._id!, {
          appliedRubricItemIds: selectedOption === 'student' 
            ? [...instructorSelections, expandedItemId]
            : instructorSelections.filter(id => id !== expandedItemId),
        });

        if (updatedSubmission.data) {
          onSubmissionUpdate(updatedSubmission.data);
          setResolvedItems(prev => ({
            ...prev,
            [expandedItemId]: selectedOption
          }));

          toast({
            title: "Success",
            description: "Dispute resolved successfully.",
          });
        } else {
          throw new Error(updatedSubmission.error?.error || 'Failed to update submission');
        }
      } else {
        throw new Error(response.error?.error || 'Failed to resolve discrepancy report');
      }

      setExpandedItemId(null);
      setSelectedOption(null);
      setComment("");
    } catch (error: any) {
      alert(error.message)

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dispute Review</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {problem.rubric.map((item) => {
            const studentSelected = studentSelections.includes(item.id);
            const instructorSelected = instructorSelections.includes(item.id);
            const isPositive = item.points >= 0;
            const isResolved = item.id in resolvedItems;
            const isDisputed = studentSelected !== instructorSelected;

            let studentIcon = studentSelected
              ? (isPositive ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />)
              : <Circle className="h-5 w-5 text-gray-400" />;

            let instructorIcon = instructorSelected
              ? (isPositive ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />)
              : <Circle className="h-5 w-5 text-gray-400" />;

            let bgColor = "bg-muted";
            if (isResolved) {
              bgColor = resolvedItems[item.id] === 'student'
                ? (isPositive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30")
                : "bg-gray-100 dark:bg-gray-800";
            } else if (isDisputed) {
              bgColor = isPositive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30";
            }

            const cursorClass = isDisputed ? "cursor-pointer" : "";
            const hoverEffect = isDisputed ? "transition-transform" : "";

            const studentExplanation = studentExplanations.find(exp => exp.rubricItemId === item.id)?.explanation;

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
                  {isResolved && (
                    <div className="absolute top-0 right-0 mt-1 mr-1">
                      <Badge variant="outline" className="text-xs">Resolved</Badge>
                    </div>
                  )}
                  {isDisputed && !isResolved && (
                    <div className="absolute top-0 right-0 mt-1 mr-1">
                      <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>
                    </div>
                  )}
                </motion.div>

                <AnimatePresence>
                  {expandedItemId === item.id && !isResolved && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-muted rounded-md mt-2 space-y-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2">Student's Explanation:</h4>
                        {studentExplanation ? (
                          <p className="text-sm italic bg-gray-100 dark:bg-gray-800 p-3 rounded">{studentExplanation}</p>
                        ) : (
                          <p className="text-sm italic bg-gray-100 dark:bg-gray-800 p-3 rounded text-gray-500">No explanation provided by the student.</p>
                        )}
                      </div>
                      <RadioGroup
                        onValueChange={value => setSelectedOption(value as "student" | "instructor")}
                        value={selectedOption}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="student" id={`student-${item.id}`} />
                          <Label htmlFor={`student-${item.id}`}>Agree with student</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="instructor" id={`instructor-${item.id}`} />
                          <Label htmlFor={`instructor-${item.id}`}>Maintain instructor's grade</Label>
                        </div>
                      </RadioGroup>
                      <Textarea
                        placeholder="Enter your resolution comment here..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        className="w-full resize-none border-2 focus:ring-2 focus:ring-primary dark:bg-black"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setExpandedItemId(null)}>Cancel</Button>
                        <Button onClick={handleSubmit}>Resolve Dispute</Button>
                      </div>
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
              <div className="text-sm text-muted-foreground mb-1">Student Grade</div>
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

