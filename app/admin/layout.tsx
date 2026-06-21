import { SidebarLayout } from "@/features/ui/SidebarLayout"
import { AdminAccessGate } from "@/features/admin/components/AdminAccessGate"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarLayout>
      <AdminAccessGate>{children}</AdminAccessGate>
    </SidebarLayout>
  )
}
