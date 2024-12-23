'use client'

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { IProblem } from '@@/models/Assignment'
import { Badge } from "@/components/ui/badge"
import { discrepancyReportApi } from '@/app/lib/client-api/discrepancyReports';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils"

interface RubricWithDiscrepancyIndicatorProps {
  assignmentId: string;
  problem: IProblem;
}

export function RubricWithDiscrepancyIndicator({ assignmentId, problem }: RubricWithDiscrepancyIndicatorProps) {
  const [discrepancyStats, setDiscrepancyStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchDiscrepancyStats = async () => {
      const stats = await discrepancyReportApi.getDiscrepancyReportStatsByRubricItem(assignmentId, problem.id, problem.rubric);
      setDiscrepancyStats(stats);
    };

    fetchDiscrepancyStats();
  }, [assignmentId, problem.id, problem.rubric]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rubric Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {problem.rubric.map((item) => {
          const isPositive = item.points >= 0;
          const disputeCount = discrepancyStats[item.id] || 0;
          
          return (
            <div key={item.id} className="flex items-center gap-4">
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
  )
}

