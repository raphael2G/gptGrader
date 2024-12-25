'use client'

import { useState, useEffect } from 'react'
import { RubricItem } from '@/lib/dummy/courses'
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface RubricSidebarProps {
  rubric: RubricItem[];
  isVisible: boolean;
  maxPoints: number;
}

export function RubricSidebar({ rubric, isVisible, maxPoints }: RubricSidebarProps) {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    const newTotal = rubric.reduce((sum, item, index) => {
      return sum + (checkedItems[index] ? item.points : 0)
    }, 0)
    setTotalPoints(Math.min(newTotal, maxPoints))
  }, [checkedItems, rubric])

  const handleCheckboxChange = (index: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  return (
    <div
      className={cn(
        "w-1/3 transition-all duration-300 ease-in-out overflow-hidden",
        isVisible ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
      )}
    >
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg h-full overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">Rubric</h3>
        <div className="text-xl font-bold mb-4">
          Total Points: {totalPoints.toFixed(1)}/{maxPoints.toFixed(1)}
        </div>
        <ul className="space-y-2">
          {rubric.map((item, index) => (
            <li
              key={index}
              onClick={() => handleCheckboxChange(index)}
              className={cn(
                "p-2 rounded-lg border flex items-center space-x-2 cursor-pointer transition-colors duration-200",
                checkedItems[index]
                  ? item.points >= 0
                    ? "border-green-500 hover:bg-green-100 dark:hover:bg-green-900"
                    : "border-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                  : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <Checkbox
                id={`rubric-item-${index}`}
                checked={checkedItems[index]}
                className={cn(
                  "transition-colors duration-200",
                  checkedItems[index]
                    ? item.points >= 0
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-red-500 bg-red-500 text-white"
                    : "border-input bg-background"
                )}
              />
              <label
                className="flex-grow cursor-pointer"
              >
                {item.description}
              </label>
              <span
                className={cn(
                  "font-medium",
                  checkedItems[index]
                    ? item.points >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                {item.points > 0 ? "+" : ""}{item.points}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

