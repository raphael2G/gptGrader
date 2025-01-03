import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { useFinalizeProblemRubric } from "@/hooks/queries/useAssignments";

interface NavigationBarProps {
  courseId: string;
  assignmentId: string;
  problemId: string;

  mode: 'viewing-graded' | 'calibration' | 'grading' | 'review' | 'self-grading' | 'professor-dispute-review';
  
  currentIndex: number;
  totalSubmissions: number;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function NavigationBar({
  currentIndex,
  totalSubmissions,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  courseId,
  assignmentId,
  problemId, 
  mode
}: NavigationBarProps) {
  const isLastSubmission = currentIndex === totalSubmissions;
  const { toast } = useToast();
  const router = useRouter();


  const { mutate: finalizeProblemRubric, isPending } = useFinalizeProblemRubric();

  const handleFinalizeRubric = () => {
    finalizeProblemRubric(
      { assignmentId, problemId },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Rubric finalized! Returning to rubric creation steps.",
          });
          router.push(`/manage-courses/${courseId}/grading/${assignmentId}/${problemId}/setup`);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to finalize rubric. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };


  return (
    <div className="w-full bg-background z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 flex justify-between items-center">
          <span className="text-sm font-medium">
            Submission {currentIndex} of {totalSubmissions}
          </span>
          <div className="flex items-center space-x-4">
            <Button
              onClick={onPrevious}
              disabled={!hasPrevious}
              variant="outline"
              size="default"
              className="w-32"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            {isLastSubmission && mode=="calibration" ? (
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 w-32"
                onClick={handleFinalizeRubric}
              >
                Finish Calibration
              </Button>
            ) : (
              <Button
                onClick={onNext}
                disabled={!hasNext}
                variant="outline"
                size="default"
                className="w-32"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

