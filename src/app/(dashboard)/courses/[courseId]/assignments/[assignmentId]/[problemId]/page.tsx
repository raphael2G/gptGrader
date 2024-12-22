'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BackButton } from '@/components/various/BackButton';
import { ProblemView } from '@/components/dashboard/courses/ProblemView';
import { GradedProblemView } from '@/components/dashboard/courses/GradedProblemView';
import { assignmentApi } from '@/app/lib/client-api/assignments';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

export default function ProblemPage({ params }: { params: { courseId: string, assignmentId: string, problemId: string } }) {
  const [gradesReleased, setGradesReleased] = useState<boolean | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const checkGradeStatus = async () => {
      try {
        const response = await assignmentApi.getAssignmentById(params.assignmentId);
        if (response.data) {
          setGradesReleased(response.data.areGradesReleased);
        } else {
          throw new Error(response.error?.error || 'Failed to fetch assignment status');
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
        router.push(`/courses/${params.courseId}/assignments/${params.assignmentId}`);
      }
    };

    checkGradeStatus();
  }, [params.assignmentId, params.courseId, toast, router]);

  if (gradesReleased === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      {gradesReleased ? (
        <GradedProblemView
          courseId={params.courseId}
          assignmentId={params.assignmentId}
          problemId={params.problemId}
        />
      ) : (
        <ProblemView
          courseId={params.courseId}
          assignmentId={params.assignmentId}
          problemId={params.problemId}
        />
      )}
    </div>
  );
}

