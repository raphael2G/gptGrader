'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface QuestionScore {
  questionNumber: number
  score: number
  maxPoints: number
}

interface CollapsibleQuestionScoreChartProps {
  scores: QuestionScore[]
  onQuestionClick: (questionNumber: number) => void
  currentQuestionIndex: number
}

export function CollapsibleQuestionScoreChart({
  scores,
  onQuestionClick,
  currentQuestionIndex
}: CollapsibleQuestionScoreChartProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={cn(
      "border rounded-lg shadow-sm transition-all duration-300 ease-in-out overflow-hidden flex flex-col",
      isExpanded ? "w-32" : "w-12"
    )}>
      <Button
        variant="ghost"
        className="w-full flex justify-center items-center p-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
      <ScrollArea className="flex-grow">
        <div className="p-2 space-y-1">
          {scores.map((score) => (
            <Button
              key={score.questionNumber}
              variant="ghost"
              className={cn(
                "w-full p-1",
                currentQuestionIndex === score.questionNumber - 1 ? "bg-accent text-accent-foreground" : ""
              )}
              onClick={() => onQuestionClick(score.questionNumber - 1)}
            >
              <div className={cn(
                "w-full",
                isExpanded ? "flex justify-between items-center" : "text-center"
              )}>
                <span>Q{score.questionNumber}</span>
                {isExpanded && (
                  <span className="text-xs">{score.score}/{score.maxPoints}</span>
                )}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

