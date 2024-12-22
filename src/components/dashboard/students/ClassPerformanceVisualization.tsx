'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StudentPerformanceChart } from '@/components/dashboard/charts/StudentPerformanceChart'

type ChartType = 'studentPerformance'

export function ClassPerformanceVisualization({ courseId }: { courseId: string }) {
  const [chartType, setChartType] = useState<ChartType>('studentPerformance')

  const renderChart = () => {
    switch (chartType) {
      case 'studentPerformance':
        return <StudentPerformanceChart courseId={courseId} />
      default:
        return <StudentPerformanceChart courseId={courseId} />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
      <CardFooter className="flex justify-center space-x-2">
        <Button 
          onClick={() => setChartType('studentPerformance')}
          variant={chartType === 'studentPerformance' ? 'default' : 'outline'}
        >
          Student Performance
        </Button>
      </CardFooter>
    </Card>
  )
}

