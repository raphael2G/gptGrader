'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { IRubricItem } from '@/models/Assignment'
import { Badge } from "@/components/ui/badge"
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"
import { useGetDiscrepancyReportsByAssignmentId } from '@/hooks/queries/useDiscrepancyReports'
import { Loader2 } from "lucide-react"
import { IDiscrepancyReport } from "@/models/DiscrepancyReport"
import { Types } from "mongoose"

interface RubricWithDiscrepancyIndicatorProps {
  assignmentId: string;
  problem: {
    _id: Types.ObjectId;
    rubric: {
      items: IRubricItem[];
    };
  };
}

// Helper function to calculate stats
function calculateDiscrepancyStats(
  problemId: string, 
  rubricItems: IRubricItem[], 
  discrepancyReports: IDiscrepancyReport[] | undefined
): Record<string, number> {
  const stats: Record<string, number> = {};
  
  // Initialize all rubric items with 0 disputes
  rubricItems.forEach(item => {
    stats[item._id.toString()] = 0;
  });

  // If we have reports, count disputes for each rubric item
  if (discrepancyReports) {
    discrepancyReports
      .filter(report => report.problemId.toString() === problemId)
      .forEach(report => {
        report.items.forEach(item => {
          const itemId = item.rubricItemId.toString();
          if (stats.hasOwnProperty(itemId)) {
            stats[itemId]++;
          }
        });
      });
  }

  return stats;
}

export function RubricWithDiscrepancyIndicator({ 
  assignmentId, 
  problem 
}: RubricWithDiscrepancyIndicatorProps) {
  // hooks
  const {
    data: discrepancyReports,
    isLoading,
    error
  } = useGetDiscrepancyReportsByAssignmentId(assignmentId);

  // Calculate stats using the helper function
  const discrepancyStats = calculateDiscrepancyStats(
    problem._id.toString(),
    problem.rubric.items,
    discrepancyReports
  );

  // loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Failed to load discrepancy data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rubric Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {problem.rubric.items.map((item) => {
          const isPositive = item.points >= 0;
          const disputeCount = discrepancyStats[item._id.toString()] || 0;
          
          return (
            <div key={item._id.toString()} className="flex items-center gap-4">
              <motion.div
                className={cn(
                  "flex-grow flex items-center justify-between p-4 rounded-md transition-colors",
                  isPositive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30",
                  "border-2",
                  isPositive ? "border-green-500" : "border-red-500"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <p className="text-sm font-medium">{item.description}</p>
                <span className={cn(
                  "font-semibold text-sm",
                  isPositive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                )}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </span>
              </motion.div>
              
              <Badge 
                variant="secondary" 
                className={cn(
                  "w-24 justify-center",
                  disputeCount > 0 
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" 
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
                )}
              >
                {disputeCount} {disputeCount === 1 ? 'dispute' : 'disputes'}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}