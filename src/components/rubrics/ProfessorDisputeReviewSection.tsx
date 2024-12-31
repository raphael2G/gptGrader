'use client';

import { useState } from 'react';
import { Check, X, Circle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// Import our React Query hooks
import { useGetAssignmentById } from '@/hooks/queries/useAssignments';
import { useGetSubmissionById } from '@/hooks/queries/useSubmissions';
import { 
  useGetDiscrepancyReportBySubmissionId,
  useResolveDiscrepancyReport 
} from '@/hooks/queries/useDiscrepancyReports';
import { UserAuth } from '@/contexts/AuthContext';

interface ProfessorDisputeReviewSectionProps {
  assignmentId: string;
  problemId: string;
  submissionId: string;
}

export const ProfessorDisputeReviewSection: React.FC<ProfessorDisputeReviewSectionProps> = ({
  assignmentId,
  problemId,
  submissionId
}) => {
  // Local state
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<'student_error' | 'grading_error' | null>(null);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const { user } = UserAuth()

  // Query hooks
  const { data: assignment, isLoading: assignmentLoading } = useGetAssignmentById(assignmentId);
  const { data: submission, isLoading: submissionLoading } = useGetSubmissionById(submissionId);
  const { 
    data: discrepancyReport, 
    isLoading: discrepancyLoading 
  } = useGetDiscrepancyReportBySubmissionId(submissionId);

  // Mutation hook
  const { mutate: resolveDiscrepancy, isPending: isResolving } = useResolveDiscrepancyReport();

  if (!user?._id){
    return <div>No user found</div>
  }

  // Loading state
  if (assignmentLoading || submissionLoading || discrepancyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Find the relevant problem from the assignment
  const problem = assignment?.problems.find(p => p._id.toString() === problemId);
  if (!problem || !submission) {
    return (
      <div className="text-center text-muted-foreground p-4">
        Error: Problem or submission not found
      </div>
    );
  }

  const studentSelections = submission.selfGradedAppliedRubricItems || [];
  const instructorSelections = submission.appliedRubricItems || [];

  const calculatePoints = (selectedItems: string[]) => {
    return problem.rubric.items.reduce((total, item) => 
      total + (selectedItems.includes(item._id.toString()) ? item.points : 0), 0
    );
  };

  const getDiscrepancyItem = (rubricItemId: string) => {
    return discrepancyReport?.items.find(item => item.rubricItemId.toString() === rubricItemId);
  };

  const handleRubricItemClick = (itemId: string) => {
    const discrepancyItem = getDiscrepancyItem(itemId);
    if (!discrepancyItem) return;
    
    setExpandedItemId(prevId => prevId === itemId ? null : itemId);
    setSelectedResolution(null);
    setComment("");
  };

  const handleSubmit = async () => {
    if (!selectedResolution || !comment || !expandedItemId) {
      toast({
        description: "Please complete all fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    resolveDiscrepancy(
      {
        submissionId,
        rubricItemId: expandedItemId,
        resolutionData: {
          shouldItemBeApplied: selectedResolution === 'student_error',
          explanation: comment,
          resolvedBy: user._id.toString() // This should come from auth context
        }
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Dispute resolved successfully.",
          });
          setExpandedItemId(null);
          setSelectedResolution(null);
          setComment("");
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    );
  };

  const renderRubricItem = (item: any) => {
    const studentSelected = studentSelections.includes(item._id.toString());
    const instructorSelected = instructorSelections.includes(item._id.toString());
    const isPositive = item.points >= 0;
    const discrepancyItem = getDiscrepancyItem(item._id.toString());
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
        const shouldBeApplied = discrepancyItem?.resolution?.shouldItemBeApplied;
        bgColor = shouldBeApplied
          ? (isPositive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30")
          : "bg-gray-200 dark:bg-gray-700";
      } else {
        bgColor = isPositive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30";
      }
    }

    return (
      <div key={item._id.toString()}>
        <motion.div
          onClick={hasDiscrepancy ? () => handleRubricItemClick(item._id.toString()) : undefined}
          className={cn(
            "relative flex items-center p-4 rounded-md border border-gray-200 dark:border-gray-700",
            bgColor,
            hasDiscrepancy ? "cursor-pointer transition-transform" : ""
          )}
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
          {expandedItemId === item._id.toString() && discrepancyItem && (
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
                      {discrepancyItem.resolution.shouldItemBeApplied === discrepancyItem.wasOriginallyApplied
                      ? 'Student Error' : 'Grading Error'}
                    </Badge>
                  </div>
                </>
              ) : (
                <>
                  <RadioGroup
                    onValueChange={(value: 'student_error' | 'grading_error') => setSelectedResolution(value)}
                    value={selectedResolution || undefined}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student_error" id={`student-error-${item._id}`} />
                      <Label htmlFor={`student-error-${item._id}`}>I agree with student</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="grading_error" id={`grading-error-${item._id}`} />
                      <Label htmlFor={`grading-error-${item._id}`}>I agree with original grading</Label>
                    </div>
                  </RadioGroup>

                  <Textarea
                    placeholder="Enter your resolution explanation here..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="w-full resize-none border-2 focus:ring-2 focus:ring-primary dark:bg-black"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setExpandedItemId(null)}
                      disabled={isResolving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={isResolving}
                      isLoading={isResolving}
                    >
                      Resolve Dispute
                    </Button>
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
          {problem.rubric.items.map(renderRubricItem)}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Student Grade</div>
              <div className="text-xl font-semibold">
                {calculatePoints(studentSelections.map(id=>id.toString()))}
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
                {calculatePoints(instructorSelections.map(id=>id.toString()))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};