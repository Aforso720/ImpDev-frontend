import { SidebarLayout } from "@/features/ui/SidebarLayout"
import { ComingSoonSection } from "@/features/ui/ComingSoonSection"

export default function TeachersPage() {
  return (
    <SidebarLayout>
      <ComingSoonSection
        title="Раздел преподавателей"
        description="Здесь будет рабочее пространство преподавателя: создание курсов, проверка практики и сопровождение траекторий."
        points={[
          "Конструктор курсов и материалов",
          "Проверка практических заданий",
          "Обмен методическими практиками между вузами",
        ]}
      />
    </SidebarLayout>
  )
}
