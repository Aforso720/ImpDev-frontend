import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview"
import { SidebarLayout } from "@/features/ui/SidebarLayout"

export default function Home() {
  return (
    <SidebarLayout>
      <DashboardOverview />
    </SidebarLayout>
  )
}
