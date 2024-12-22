'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submissionApi } from '@/app/lib/client-api/submissions';
import { ISubmission } from '@@/models/Submission';
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

export default function CalibrationSetupPage({ params }: { params: { courseId: string, assignmentId: string, problemId: string } }) {
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [numCalibrations, setNumCalibrations] = useState<number>(1);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const response = await submissionApi.getSubmissionsByProblemId(params.problemId);
        if (response.data) {
          setSubmissions(response.data);
        } else {
          throw new Error(response.error?.error || 'Failed to fetch submissions');
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch submissions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [params.problemId, toast]);

  const handleNumCalibrationsChange = (value: string) => {
    setNumCalibrations(parseInt(value));
  };

  const handleStartCalibration = () => {
    router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/calibration?n=${numCalibrations}`);
  };

  if (loading) {
    return <div>Loading submissions...</div>;
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

