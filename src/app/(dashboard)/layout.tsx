import { Sidebar } from '@/components/dashboard/Sidebar'
import { ThemeProvider } from '@/components/dashboard/ThemeProvider'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { MainContent } from '@/components/dashboard/MainContent'


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {




  return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider>
                <Sidebar />
                <MainContent>
                    {children}
                </MainContent>
            </SidebarProvider>
        </ThemeProvider>
  )
}

