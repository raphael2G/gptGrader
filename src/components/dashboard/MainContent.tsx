'use client'

import { useSidebar } from '@/contexts/SidebarContext'
import { cn } from "@/lib/utils"

export function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <div className={cn(
      "transition-all duration-300 ease-in-out",
      isCollapsed ? "ml-16" : "ml-64",
      "p-4"
    )}>
      <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
        {children}
      </div>
    </div>
  )
}

