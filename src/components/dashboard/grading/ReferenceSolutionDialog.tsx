import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { assignmentApi } from '@/app/lib/client-api/assignments'

interface ReferenceSolutionDialogProps {
  assignmentId: string;
  problemId: string;
  questionNumber: number;
  initialSolution?: string;
  onUpdate: (newSolution: string) => void;
}

export function ReferenceSolutionDialog({ assignmentId, problemId, questionNumber, initialSolution, onUpdate }: ReferenceSolutionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [solution, setSolution] = useState(initialSolution || '');
  const { toast } = useToast();

  useEffect(() => {
    setSolution(initialSolution || '');
  }, [initialSolution]);

  const handleUpdate = async () => {
    try {
      const response = await assignmentApi.updateProblemReferenceSolution(assignmentId, problemId, solution);
      if (response.data) {
        onUpdate(solution);
        setIsOpen(false);
        toast({
          title: "Success",
          description: "Reference solution updated successfully.",
        });
      } else {
        throw new Error(response.error?.error || 'Failed to update reference solution');
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update reference solution. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {initialSolution ? "View Reference Solution" : "Add Reference Solution"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Q{questionNumber} - Reference Solution </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Type your reference solution here..."
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            className="h-[300px]"
          />
        </div>
        <Button onClick={handleUpdate}>Update and Close</Button>
      </DialogContent>
    </Dialog>
  );
}

