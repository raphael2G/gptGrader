import { ScrollArea } from "@/components/ui/scroll-area"

interface StudentResponseProps {
  response: string;
}

export function StudentResponse({ response }: StudentResponseProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold text-primary">Student's Response</h3>
      <ScrollArea className="h-[300px] w-full rounded-md border bg-muted p-4">
        <pre className="whitespace-pre-wrap text-foreground font-mono text-sm">{response}</pre>
      </ScrollArea>
    </div>
  )
}

