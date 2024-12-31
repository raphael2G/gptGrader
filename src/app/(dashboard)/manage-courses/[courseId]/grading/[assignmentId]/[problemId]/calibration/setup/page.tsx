'use client'

import { useRouter } from 'next/navigation';
import { useGetSubmissionsByProblemId } from '@/hooks/queries/useSubmissions';
import { useToast } from "@/components/ui/use-toast";
import { BackButton } from '@/components/various/BackButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from "lucide-react";
import { useState } from 'react';

export default function CalibrationSetupPage({ params }: { params: { courseId: string, assignmentId: string, problemId: string } }) {
  // Standard stuff
  const router = useRouter();
  const { toast } = useToast();

  // Hooks
  const { 
    data: submissions = [], 
    isLoading,
    error 
  } = useGetSubmissionsByProblemId(params.problemId);

  // States
  const [numCalibrations, setNumCalibrations] = useState<number>(1);

  // Component specific functions
  const handleNumCalibrationsChange = (value: string) => {
    setNumCalibrations(parseInt(value));
  };

  const handleStartCalibration = () => {
    router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/calibration?n=${numCalibrations}`);
  };

  // Loading & error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !submissions) {
    toast({
      title: "Error",
      description: error?.message || "Failed to fetch submissions. Please try again.",
      variant: "destructive",
    });
    router.back();
    return null;
  }

  const calibrationOptions = [1, 5, 10, 20];
  const availableOptions = calibrationOptions.filter(option => option <= submissions.length);

  return (
    <div className="space-y-6">
      <BackButton backLink={`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/setup`} />
      <Card>
        <CardHeader>
          <CardTitle>Calibration Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground mb-4">Select the number of submissions you would like to use for calibration:</p>
          <Select onValueChange={handleNumCalibrationsChange} value={numCalibrations.toString()}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Select number of submissions" />
            </SelectTrigger>
            <SelectContent>
              {availableOptions.map((option) => (
                <SelectItem key={option} value={option.toString()} disabled={option > submissions.length}>
                  {option} {option > submissions.length ? '(Not enough submissions)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleStartCalibration} disabled={availableOptions.length === 0}>
              Start Calibration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}