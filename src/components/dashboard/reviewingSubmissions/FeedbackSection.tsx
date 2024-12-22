import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface FeedbackSectionProps {
  feedback: string;
  onFeedbackChange: (feedback: string) => void;
}

export function FeedbackSection({ feedback, onFeedbackChange }: FeedbackSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          placeholder="Provide feedback to the student..."
          rows={5}
        />
      </CardContent>
    </Card>
  )
}

