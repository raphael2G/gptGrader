import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface QuestionDisplayProps {
  question: string;
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold text-primary">Question</h3>
      <Card className="bg-muted">
        <CardContent className="p-6">
          <p className="text-foreground text-lg leading-relaxed">{question}</p>
        </CardContent>
      </Card>
    </div>
  )
}

