import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useGetAssignmentById } from '@/hooks/queries/useAssignments';
import { Loader2 } from 'lucide-react';
import { useUpdateProblemReferenceSolution } from '@/hooks/queries/useAssignments';

interface ReferenceSolutionDialogProps {
  assignmentId: string;
  problemId: string;
}

export function ReferenceSolutionDialog({ 
  assignmentId, 
  problemId
}: ReferenceSolutionDialogProps) {
  // Local UI state
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Get assignment data to find problem details
  const { 
    data: assignment, 
    isLoading: assignmentLoading,
    error: assignmentError 
  } = useGetAssignmentById(assignmentId);


  // Mutation for updating reference solution
  const { mutate: updateProblemRefSol, isPending } = useUpdateProblemReferenceSolution();


  // Find the problem and its index
  const problem = assignment?.problems.find(p => p._id?.toString() === problemId);

    // Handle loading state
    if (assignmentLoading) {
      return (
        <Button variant="outline" disabled>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading...
        </Button>
      );
    }
  
    // Handle error state
    if (assignmentError || !problem || !assignment) {
      return (
        <Button 
          variant="outline" 
          disabled 
          onClick={() => {
            toast({
              title: "Error",
              description: "Could not load reference solution",
              variant: "destructive"
            });
          }}
        >
          Error Loading Solution
        </Button>
      );
    }
  
  // Local state for solution text, initialized from problem data
  const [solution, setSolution] = useState(problem?.referenceSolution || '');
  const questionNumber = problem ? assignment.problems.indexOf(problem) + 1 : 0;


  // Update solution state when problem data changes
  useEffect(() => {
    if (problem?.referenceSolution) {
      setSolution(problem.referenceSolution);
    }
  }, [problem]);


  // Handler for updating the reference solution
  const handleUpdate = () => {
    updateProblemRefSol(
      
      {
        assignmentId: assignmentId, 
        problemId: problemId,
        referenceSolution: solution
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          toast({
            title: "Success",
            description: "Reference solution updated successfully",
            variant: "success"
          });
        },
        onError: (error) => {
          toast({
            title: "Error updating reference solution",
            description: "Please try again",
            variant: "destructive"
          });
        }
      }
    );
  };



  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {problem.referenceSolution ? "View Reference Solution" : "Add Reference Solution"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Q{questionNumber} - Reference Solution</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Type your reference solution here..."
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            className="h-[300px]"
          />
        </div>
        <Button 
          onClick={handleUpdate}
          isLoading={isPending}
        >
          Update and Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}