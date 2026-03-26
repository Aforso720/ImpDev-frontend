import { Suspense } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider} from "@/components/ui/sidebar"
import { PageHeader } from "@/features/ui/PageHeader"

export function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>){
  return (
    <SidebarProvider>
       <AppSidebar />
            <SidebarInset>
              <Suspense fallback={<div className="h-16 shrink-0" />}>
                <PageHeader/>
              </Suspense>
              <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                {children}
            </div>
            </SidebarInset>
    </SidebarProvider>
  )
}
