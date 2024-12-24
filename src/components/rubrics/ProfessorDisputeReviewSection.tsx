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
import { IDiscrepancyReport, IDiscrepancyItem } from '@@/models/DiscrepancyReport';
import { cn } from "@/lib/utils";

interface ProfessorDisputeReviewSectionProps {
  problem: IProblem;
  submission: ISubmission | null;
  studentId: string;
  onSubmissionUpdate: (updatedSubmission: ISubmission) => void;
}

export const ProfessorDisputeReviewSection: React.FC<ProfessorDisputeReviewSectionProps> = ({
  problem,
  submission,
  studentId,
  onSubmissionUpdate
}) => {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<'student_error' | 'grading_error' | null>(null);
  const [shouldBeApplied, setShouldBeApplied] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [discrepancyReport, setDiscrepancyReport] = useState<IDiscrepancyReport | null>(null);
  const { toast } = useToast();

  const studentSelections = submission?.selfAssessedRubricItems?.map(i => i.rubricItemId) || [];
  const instructorSelections = submission?.appliedRubricItemIds || [];

  useEffect(() => {
    const fetchDiscrepancyReport = async () => {
      if (submission?._id) {
        try {
          const response = await discrepancyReportApi.getDiscrepancyReportsBySubmission(submission._id);
          if (response.data && response.data.length > 0) {
            setDiscrepancyReport(response.data[0]); // Assuming one report per submission
          }
        } catch (error: any) {
          console.error("Failed to fetch discrepancy report:", error);
          toast({
            title: "Error",
            description: `Failed to fetch discrepancy report: ${error.message}`,
            variant: "destructive",
          });
        }
      }
    };

    fetchDiscrepancyReport();
  }, [submission?._id, toast]);

  const calculatePoints = (selectedItems: string[]) => {
    return problem.rubric.reduce((total, item) => 
      total + (selectedItems.includes(item.id) ? item.points : 0), 0
    );
  };

  const getDiscrepancyItem = (rubricItemId: string): IDiscrepancyItem | undefined => {
    return discrepancyReport?.items.find(item => item.rubricItemId === rubricItemId);
  };

  const handleRubricItemClick = (itemId: string) => {
    const discrepancyItem = getDiscrepancyItem(itemId);
    if (!discrepancyItem) return;
    
    setExpandedItemId(prevId => prevId === itemId ? null : itemId);
    if (discrepancyItem.resolution) {
      setSelectedResolution(discrepancyItem.resolution.discrepancyType);
      setShouldBeApplied(discrepancyItem.resolution.shouldBeApplied);
      setComment(discrepancyItem.resolution.explanation);
    } else {
      setSelectedResolution(null);
      setShouldBeApplied(null);
      setComment("");
    }
  };

  const handleSubmit = async () => {
    console.log("selected resolution: ", selectedResolution)
    console.log("shouldBeApplied: ", shouldBeApplied)
    console.log("comment: ", comment)
    console.log("expandedItemId: ", expandedItemId)
    console.log("submission?._id: ", submission?._id)
    console.log("discrepancyReport?._id: ", discrepancyReport?._id)
    if (!selectedResolution || !comment || !expandedItemId || !submission?._id || !discrepancyReport?._id) {

      alert("fail")


      toast({
        description: "Please complete all fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Resolve the specific discrepancy item
      const response = await discrepancyReportApi.resolveDiscrepancyItem(
        submission?._id,
        expandedItemId,
        {
          shouldBeApplied: true,
          explanation: comment,
          discrepancyType: selectedResolution
        }
      );

      if (response.data) {
        // Update submission's applied rubric items based on resolution
        const updatedAppliedItems = shouldBeApplied
          ? [...instructorSelections, expandedItemId]
          : instructorSelections.filter(id => id !== expandedItemId);

        const updatedSubmission = await submissionApi.updateSubmission(submission._id, {
          appliedRubricItemIds: updatedAppliedItems,
        });

        if (updatedSubmission.data) {
          onSubmissionUpdate(updatedSubmission.data);
          
          // Update local discrepancy report state
          setDiscrepancyReport(prev => {
            if (!prev) return null;
            return {
              ...prev,
              items: prev.items.map(item => 
                item.rubricItemId === expandedItemId
                  ? {
                      ...item,
                      resolution: {
                        shouldBeApplied,
                        explanation: comment,
                        discrepancyType: selectedResolution,
                        resolvedBy: 'instructor', // This should come from auth context
                        resolvedAt: new Date()
                      }
                    }
                  : item
              )
            };
          });

          toast({
            title: "Success",
            description: "Dispute resolved successfully.",
          });
        }
      }

      setExpandedItemId(null);
      setSelectedResolution(null);
      setShouldBeApplied(null);
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

  const renderRubricItem = (item: any) => {
    const studentSelected = studentSelections.includes(item.id);
    const instructorSelected = instructorSelections.includes(item.id);
    const isPositive = item.points >= 0;
    const discrepancyItem = getDiscrepancyItem(item.id);
    const hasDiscrepancy = Boolean(discrepancyItem);
    const isResolved = Boolean(discrepancyItem?.resolution);
    
    const studentIcon = studentSelected
      ? (isPositive ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />)
      : <Circle className="h-5 w-5 text-gray-400" />;

    const instructorIcon = instructorSelected
      ? (isPositive ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />)
      : <Circle className="h-5 w-5 text-gray-400" />;

    let bgColor = "bg-muted";
    if (hasDiscrepancy) {

      if (isResolved) {
        const instructorApplied = discrepancyItem?.resolution?.shouldBeApplied;
        bgColor = instructorApplied
          ? (isPositive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30")
          : "bg-gray-200 dark:bg-gray-700";
      }

      bgColor = (isPositive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30");

    }

    return (
      <div key={item.id}>
        <motion.div
          onClick={hasDiscrepancy ? () => handleRubricItemClick(item.id) : undefined}
          className={`relative flex items-center p-4 rounded-md border border-gray-200 dark:border-gray-700 ${bgColor} ${hasDiscrepancy ? "cursor-pointer transition-transform" : ""}`}
          whileHover={hasDiscrepancy ? { scale: 1.02 } : {}}
          whileTap={hasDiscrepancy ? { scale: 0.98 } : {}}
        >
          <div className="w-1/2 pr-2">{studentIcon}</div>
          <div className="flex-grow">
            <span className="text-sm">{item.description}</span>
            <span className={cn(
              "font-semibold text-sm ml-2",
              isPositive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
            )}>
              ({item.points > 0 ? '+' : ''}{item.points})
            </span>
          </div>
          <div className="w-1/2 pl-2 text-right">{instructorIcon}</div>
          
          {hasDiscrepancy && (
            <div className="absolute top-0 right-0 mt-1 mr-1">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  isResolved
                    ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                )}
              >
                {isResolved ? 'Resolved' : 'Pending'}
              </Badge>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {expandedItemId === item.id && discrepancyItem && (
            <motion.div
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-muted rounded-md mt-2 space-y-4 border border-gray-200 dark:border-gray-700"
            >


              <div>
                <h5 className="text-sm font-semibold text-muted-foreground mb-1">Student's Explanation:</h5>
                <div className="mt-2 text-sm prose max-w-none">
                  <p className="pl-4 text-sm text-muted-foreground">
                    {discrepancyItem.studentExplanation || "No explanation provided by the student."}
                  </p>
                </div>
              </div>
              
              {discrepancyItem.resolution ? (
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
                      discrepancyItem.resolution.shouldBeApplied
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                    }>
                      {discrepancyItem.resolution.shouldBeApplied ? "Apply Rubric Item" : "Do Not Apply Rubric Item"}
                    </Badge>
                    <Badge variant="outline" className={
                      discrepancyItem.resolution.discrepancyType === 'student_error'
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                    }>
                      {discrepancyItem.resolution.discrepancyType === 'student_error' ? 'Student Error' : 'Grading Error'}
                    </Badge>
                  </div>
                </>
              ) : (
                <>
                  <RadioGroup
                    onValueChange={(value: 'student_error' | 'grading_error') => setSelectedResolution(value)}
                    value={selectedResolution}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student_error" id={`student-error-${item.id}`} />
                      <Label htmlFor={`student-error-${item.id}`}>I agree with student</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="grading_error" id={`grading-error-${item.id}`} />
                      <Label htmlFor={`grading-error-${item.id}`}>I agree with original grading</Label>
                    </div>
                  </RadioGroup>



                  <Textarea
                    placeholder="Enter your resolution explanation here..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="w-full resize-none border-2 focus:ring-2 focus:ring-primary dark:bg-black"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setExpandedItemId(null)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Resolve Dispute</Button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dispute Review</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {problem.rubric.map(renderRubricItem)}
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
}