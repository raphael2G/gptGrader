'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IProblem } from '@@/models/Assignment';
import { ISubmission } from '@@/models/Submission';
import { submissionApi } from '@/app/lib/client-api/submissions';

interface SelfGradingSectionProps {
  problem: IProblem;
  submission: ISubmission;
  onSelfGradingComplete: (updatedSubmission: ISubmission) => void;
}

export function SelfGradingRubric({ problem, submission, onSelfGradingComplete }: SelfGradingSectionProps) {
  const [selections, setSelections] = useState<string[]>(submission.selfAssessedRubricItems?.map(i => i.rubricItemId) || []);

  const toggleRubricItem = (itemId: string) => {
    setSelections(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const calculatePoints = (selectedItems: string[]) => {
    return problem.rubric.reduce((total, item) => 
      total + (selectedItems.includes(item.id) ? item.points : 0), 0
    );
  };

  const handleSubmitSelfGrade = async () => {
    try {
      const updatedSubmission = await submissionApi.updateSubmission(submission._id!, {
        selfAssessedRubricItems: selections.map(id => ({ rubricItemId: id })),
        selfGraded: true,
        selfGradingStatus: 'completed',
        selfGradingCompletedAt: new Date(),
      });

      if (updatedSubmission.data) {
        onSelfGradingComplete(updatedSubmission.data);
      } else {
        throw new Error(updatedSubmission.error?.error || 'Failed to update submission');
      }
    } catch (error: any) {
      console.error('Failed to submit self-grade:', error);
      // You might want to show an error toast here
    }
  };

  return (
    <Card className="w-1/3">
      <CardHeader>
        <CardTitle>Self-Grading</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {problem.rubric.map((item) => {
            const isSelected = selections.includes(item.id);
            const isPositive = item.points >= 0;

            return (
              <motion.div
                key={item.id}
                onClick={() => toggleRubricItem(item.id)}
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
        >
          Submit Self-Grade
        </Button>
      </CardContent>
    </Card>
  );
}

