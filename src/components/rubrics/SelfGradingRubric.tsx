'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IProblem } from '@/models/Assignment';
import { ISubmission } from '@/models/Submission';
import { Types } from 'mongoose';
import { useUpdateSubmissionSelfGrading } from '@/hooks/queries/useSubmissions';
import { useToast } from '../ui/use-toast';


interface SelfGradingRubricProps {
  problem: IProblem;
  submission: ISubmission;
}

export function SelfGradingRubric({ 
  problem, 
  submission, 
}: SelfGradingRubricProps) {

  const { toast } = useToast();
  // Convert ObjectIds to strings for state management
  const [selections, setSelections] = useState<Types.ObjectId[]>(
    submission.selfGradedAppliedRubricItems || []
  );

  const { mutate: updateSelfGrading, isPending } = useUpdateSubmissionSelfGrading();

  const toggleRubricItem = (itemId: Types.ObjectId) => {
    setSelections(prev => 
      prev.some(id => id.toString() === itemId.toString())
        ? prev.filter(id => !(id.toString() === itemId.toString()))
        : [...prev, itemId]
    );
  };

  const calculatePoints = (selectedItems: Types.ObjectId[]) => {
    return problem.rubric.items.reduce((total, item) => 
      total + (selectedItems.some(id => (id.toString() === item._id.toString())) ? item.points : 0), 
      0
    );
  };

  const handleSubmitSelfGrade = () => {
    updateSelfGrading(
      {
        submissionId: submission._id!.toString(),
        selfGradedAppliedRubricItems: selections.map(item=>item.toString())
      },
      {
        onSuccess: (updatedSubmission) => {
          toast({
            title: "Nice! Your self grading has been submitted", 
          })
        },
        onError: (error) => {
          console.error('Failed to submit self-grade:', error);
          // You might want to show an error toast here
        }
      }
    );
  };

  return (
    <Card className="w-1/3">
      <CardHeader>
        <CardTitle>Self-Grading</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {problem.rubric.items.map((item) => {
            const isSelected = selections.some(id => id.toString() === item._id.toString());
            const isPositive = item.points >= 0;

            return (
              <motion.div
                key={item._id!.toString()}
                onClick={() => toggleRubricItem(item._id!)}
                className={cn(
                  "flex items-center p-4 rounded-md transition-colors cursor-pointer",
                  isSelected && isPositive && "bg-green-100 dark:bg-green-900/30 border-2 border-green-500",
                  isSelected && !isPositive && "bg-red-100 dark:bg-red-900/30 border-2 border-red-500",
                  !isSelected && "bg-muted hover:bg-muted/80 dark:hover:bg-muted/50"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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

        <Button 
          className="w-full mt-4" 
          onClick={handleSubmitSelfGrade}
          isLoading={isPending}
        >
          Submit Self-Grade
        </Button>
      </CardContent>
    </Card>
  );
}