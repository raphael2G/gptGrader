import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Progress } from "@/components/ui/progress"
import { analyzeApi } from '@/api-client/endpoints/analyze';
import { useInvalidateSubmissions } from '@/hooks/queries/queryKeyInvalidation';

interface ReferenceSolutionDialogProps {
  isRubricFinalized: boolean;
}



export function GradeAllSubmissionConfirmation({ isRubricFinalized }: ReferenceSolutionDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [progress, setProgress] = useState({
    totalSubmissions: 0,
    completedSubmissions: 0,
    failedSubmissions: 0
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const invalidateSubmissions = useInvalidateSubmissions()

  useEffect(() => {
    return () => {
      // Cleanup: abort any ongoing grading when component unmounts
      abortControllerRef.current?.abort();
    };
  }, []);

  const mockGrading = async () => {
    setIsGrading(true);
    setIsOpen(true);
    
    // Initial delay before starting
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const totalSubmissions = 10;
    setProgress(prev => ({ ...prev, totalSubmissions }));

    // Add delay before starting submissions
    await new Promise(resolve => setTimeout(resolve, 1000));

    for (let i = 0; i < totalSubmissions; i++) {
      if (!isGrading) break; // Check if cancelled

      // Simulate random failures
      const failed = Math.random() < 0.1;
      
      // Random delay between 1-2 seconds per submission
      const delay = Math.random() * 1000 + 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      setProgress(prev => ({
        ...prev,
        completedSubmissions: i + 1,
        failedSubmissions: failed ? prev.failedSubmissions + 1 : prev.failedSubmissions
      }));
    }

    toast({
      title: "Success",
      description: `Successfully graded ${totalSubmissions} submissions (Test Mode)`,
    });
    
    setIsGrading(false);
    setIsOpen(false);
    router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/graded`);
  };

  const handleGradeAllSubmissions = async () => {
    setIsGrading(true);
    
    try {
      abortControllerRef.current = analyzeApi.gradeAllSubmissions(
        params.assignmentId as string,
        params.problemId as string,
        {
          onProgress: (progressData) => {
            setProgress(progressData);
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: error.message || "Failed to grade submissions",
              variant: "destructive",
            });
            setIsGrading(false);
            invalidateSubmissions({
              assignmentId: params.assignmentId as string,
              problemId: params.problemId as string,
            })
          },
          onComplete: (finalProgress) => {
            toast({
              title: "Success",
              description: `Successfully graded ${finalProgress.completedSubmissions - finalProgress.failedSubmissions} submissions`,
            });
            setIsGrading(false);
            invalidateSubmissions({
              assignmentId: params.assignmentId as string,
              problemId: params.problemId as string,
            })
            router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/graded`);
          }
        }
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start grading process",
        variant: "destructive",
      });
      invalidateSubmissions({
        assignmentId: params.assignmentId as string,
        problemId: params.problemId as string,
      })
      setIsGrading(false);
    } 
  };

  const handleCancel = () => {
    if (isGrading) {
      abortControllerRef.current?.abort();
      setIsGrading(false);
    }
    setIsOpen(false);
  };

  const percentComplete = progress.totalSubmissions 
    ? Math.round((progress.completedSubmissions / progress.totalSubmissions) * 100)
    : 0;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={!isRubricFinalized}
        variant={isRubricFinalized ? "default" : "secondary"}
        className={`w-full ${!isRubricFinalized ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isGrading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Grading...
          </>
        ) : (
          "Grade Assignment"
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={handleCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isGrading ? "Grading in Progress" : "Confirm Grading"}
            </DialogTitle>
          </DialogHeader>
          
          {isGrading ? (
            <div className="space-y-4 py-4">
              <Progress value={percentComplete} className="w-full" />
              <div className="text-sm text-gray-500">
                Processed {progress.completedSubmissions} of {progress.totalSubmissions} submissions
                {progress.failedSubmissions > 0 && (
                  <div className="text-red-500">
                    Failed: {progress.failedSubmissions}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p>
              Are you sure you want to grade all assignments with AI? 
              It will use the most recent rubric.
            </p>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={handleCancel}>
              {isGrading ? "Cancel" : "No"}
            </Button>
            {!isGrading && (
              <Button
                onClick={handleGradeAllSubmissions}
                className="ml-2"
              >
                Yes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}