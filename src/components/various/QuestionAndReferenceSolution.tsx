import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { IProblem } from '@/models/Assignment'

interface QuestionAndReferenceSolutionProps {
  problem: IProblem;
}

export function QuestionAndReferenceSolution({ problem }: QuestionAndReferenceSolutionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Question and Reference Solution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Question:</h3>
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm leading-relaxed">{problem.question}</p>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Reference Solution:</h3>
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {problem.referenceSolution || "No reference solution provided."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

