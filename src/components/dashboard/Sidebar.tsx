'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Book, User, Settings, ChevronRight, ChevronLeft, Sun, Moon, Briefcase } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { isUserInstructor } from '@/hooks/user-status'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from '@/contexts/SidebarContext'
import FeedbackDialog from '../various/FeedbackReport'

const SidebarItem = ({ icon: Icon, label, href, isCollapsed }: { icon: any, label: string, href: string, isCollapsed: boolean }) => (
  <Link href={href} className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 ease-in-out">
    <Icon className="shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
    <span className={cn("ml-3 whitespace-nowrap transition-all duration-300 ease-in-out", 
      isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
    )}>
      {label}
    </span>
  </Link>
)

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(()=>{
    setTheme("light")
  }, [theme])

  if (!mounted) {
    return null
  }

  return (
    <aside className={cn(
      "fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out",
      isCollapsed ? "w-[64px]" : "w-64"
    )}>
      <div className="h-full px-3 py-4 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between items-center mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
          {/* <div className={cn("transition-all duration-300 ease-in-out", 
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  {theme === "light" ? <Sun /> : <Moon />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div> */}
        </div>
        <ul className="space-y-2 font-medium">
          <li>
            <SidebarItem icon={Book} label="My Courses" href="/courses" isCollapsed={isCollapsed} />
          </li>


          {isUserInstructor() && (<li>
            <SidebarItem icon={Briefcase} label="Manage Courses" href="/manage-courses" isCollapsed={isCollapsed} />
          </li>)}

          <li>
            <SidebarItem icon={User} label="Account" href="/account" isCollapsed={isCollapsed} />
          </li>
          <li>
            <SidebarItem icon={Settings} label="Settings" href="/settings" isCollapsed={isCollapsed} />
          </li>

          <div className="mt-auto pt-2 border-t border-gray-200 dark:border-gray-700">
            <FeedbackDialog isCollapsed={isCollapsed} />
          </div>
        </ul>
      </div>
    </aside>
  )
}

