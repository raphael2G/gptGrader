'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BackButton } from '@/components/various/BackButton'
import { assignmentApi } from '@/app/lib/client-api/assignments'
import { IAssignment, IProblem } from '@@/models/Assignment'
import { useToast } from "@/components/ui/use-toast"

export default function ProblemGradingPage({ 
  params 
}: { 
  params: { courseId: string, assignmentId: string, problemId: string } 
}) {
  const router = useRouter()

  useEffect(() => {
    router.push(`/manage-courses/${params.courseId}/grading/${params.assignmentId}/${params.problemId}/setup`)
  }, [params.courseId, params.assignmentId, params.problemId, router])

  return (
    <div className="space-y-6">
      <BackButton backLink={`/manage-courses/${params.courseId}/grading/${params.assignmentId}`} />
      <h1 className="text-3xl font-bold">Grading: {null} - Problem {null}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Redirecting...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we redirect you to the appropriate page.</p>
        </CardContent>
      </Card>
    </div>
  )
}

