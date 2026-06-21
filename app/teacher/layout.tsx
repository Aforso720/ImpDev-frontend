import { SidebarLayout } from "@/features/ui/SidebarLayout"
import { TeacherAccessGate } from "@/features/teacher/components/TeacherAccessGate"

export default function TeacherLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarLayout>
      <TeacherAccessGate>{children}</TeacherAccessGate>
    </SidebarLayout>
  )
}
