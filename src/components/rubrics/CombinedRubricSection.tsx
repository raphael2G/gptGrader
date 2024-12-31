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

import { cn } from "@/lib/utils";
import { useGetAssignmentById } from '@/hooks/queries/useAssignments';
import { useGetSubmissionsByStudentIdAssignmentIdAndProblemId } from '@/hooks/queries/useSubmissions';
import { IDiscrepancyItem } from '@/models/DiscrepancyReport';
import { ISubmission } from '@/models/Submission';
import {
  useCreateOrUpdateDiscrepancyReport, 
  useGetDiscrepancyReportBySubmissionId
} from "@/hooks/queries/useDiscrepancyReports"


interface CombinedRubricSectionProps {
  assignmentId: string;
  problemId: string;
  studentId: string;
}

export function CombinedRubricSection({ assignmentId, problemId, studentId }: CombinedRubricSectionProps) {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<"student" | "instructor" | null>(null);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  // Fetch assignment data
  const { data: assignment, isLoading: isLoadingAssignment } = useGetAssignmentById(assignmentId);
  const problem = assignment?.problems.find(p => p._id?.toString() === problemId);

  // Fetch submission data
  const { 
    data: submission, 
    isLoading: isLoadingSubmission 
  } = useGetSubmissionsByStudentIdAssignmentIdAndProblemId(studentId, assignmentId, problemId);

  // Fetch discrepancy report data using placeholder hook
  const { 
    data: discrepancyReport, 
    isLoading: isLoadingDiscrepancy 
  } = useGetDiscrepancyReportBySubmissionId(submission?._id?.toString() || '', {enabled: !!submission});

  // Create/update discrepancy report mutation using placeholder hook
  const { mutate: createOrUpdateDiscrepancy, isPending: isSubmitting } = useCreateOrUpdateDiscrepancyReport();

  // Rest of the component remains the same...
  if (isLoadingAssignment || isLoadingSubmission || isLoadingDiscrepancy || !problem || !submission) {
    return <div>Loading...</div>;
  }

  if (!assignment){
    return <div>Could not find assignment</div>
  }

  if (!submission){
    return <div>Could not find submission</div>
  }


  const studentSelections = submission?.selfGradedAppliedRubricItems?.map((id) => id.toString()) || [];


  const instructorSelections = submission?.appliedRubricItems?.map((id) => id.toString()) || [];



  const calculatePoints = (selectedItems: string[] | undefined) => {
    if (!problem || !selectedItems) return 0;
    return problem.rubric.items.reduce((total, item) =>
      total + (selectedItems.includes(item._id?.toString() || '') ? item.points : 0), 0
    );
  };

  const handleRubricItemClick = (itemId: string) => {
    setExpandedItemId(prevId => prevId === itemId ? null : itemId);
    if (!discrepancyReport?.items.find(i => i.rubricItemId.toString() === itemId)) {
      setSelectedOption(null);
      setComment("");
    }
  };

  const handleSubmit = () => {
    if (!selectedOption || !comment || !expandedItemId || !submission?._id) {
      toast({
        description: "Please select an option and provide a comment.",
        variant: "destructive",
      });
      return;
    }

    const discrepancyItem = {
      submissionId: submission._id.toString(),
      studentId: studentId,
      courseId: assignment.courseId.toString(),
      assignmentId: assignmentId,
      problemId: problemId,
      rubricItemId: expandedItemId,
      wasOriginallyApplied: instructorSelections.includes(expandedItemId),
      studentThinksShouldBeApplied: selectedOption === 'instructor',
      studentExplanation: comment,
    };

    createOrUpdateDiscrepancy(discrepancyItem, {
      onSuccess: () => {
        setExpandedItemId(null);
        setSelectedOption(null);
        setComment("");
        toast({
          title: "Success",
          description: "Discrepancy report submitted successfully.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card className="w-1/3">
      <CardHeader>
        <CardTitle>Grading Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {problem.rubric.items.map((item) => {
            const studentSelected = studentSelections.includes(item._id.toString());
            const instructorSelected = instructorSelections.includes(item._id.toString());

            const isPositive = item.points >= 0;
            const discrepancyItem = discrepancyReport?.items.find(i => i.rubricItemId === item._id);
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
              const instructorApplied = discrepancyItem?.resolution?.shouldItemBeApplied;
              bgColor = instructorApplied
                ? (isPositive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30")
                : "bg-gray-200 dark:bg-gray-700";
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
              <div key={item._id.toString()}>
                <motion.div
                  onClick={isDisputed || discrepancyItem ? () => handleRubricItemClick(item._id.toString()) : undefined}
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
                      {expandedItemId === item._id.toString() ? (
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
                  {expandedItemId === item._id.toString() && (isDisputed || discrepancyItem) && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-muted rounded-md mt-2 space-y-4 border border-gray-200 dark:border-gray-700"
                    >
                      {discrepancyItem ? (
                        <>
                          <h4 className="font-semibold mb-4">Discrepancy Report</h4>
                          <div className="space-y-4">
                            <div>
                              <h5 className="text-sm font-semibold text-muted-foreground mb-1">Student's Explanation:</h5>
                              <div className="mt-2 text-sm prose max-w-none">
                                <p className="pl-4 text-sm text-muted-foreground">
                                  {discrepancyItem.studentExplanation || "No explanation provided by the student."}
                                </p>
                              </div>

                            </div>
                            {discrepancyItem.resolution && (
                              <>
                                <div>
                                  <h5 className="text-sm font-semibold text-muted-foreground mb-1">Instructor's Feedback:</h5>
                                  <div className="mt-2 text-sm prose max-w-none">
                                    <p className="pl-4 text-sm text-muted-foreground">
                                      {discrepancyItem.resolution.explanation}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                  <Badge variant="default" className={
                                    discrepancyItem.resolution.shouldItemBeApplied
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                  }>
                                    {discrepancyItem.resolution.shouldItemBeApplied ? "Apply Rubric Item" : "Do Not Apply Rubric Item"}
                                  </Badge>
                                  <Badge variant="outline" className={
                                    discrepancyItem.resolution.shouldItemBeApplied === discrepancyItem.wasOriginallyApplied
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                                  }>
                                    {discrepancyItem.resolution.shouldItemBeApplied === discrepancyItem.wasOriginallyApplied ? 'Student Error' : 'Grading Error'}
                                  </Badge>
                                </div>
                              </>
                            )}
                          </div>
                        </>
                      ) : isDisputed ? (
                        <>
                          <RadioGroup
                            onValueChange={value => setSelectedOption(value as "student" | "instructor")}
                            value={selectedOption}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="student" id={`student-${item._id}`} />
                              <Label htmlFor={`student-${item._id}`}>I am wrong (student)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="instructor" id={`instructor-${item._id}`} />
                              <Label htmlFor={`instructor-${item._id}`}>The initial grade is wrong (instructor)</Label>
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

