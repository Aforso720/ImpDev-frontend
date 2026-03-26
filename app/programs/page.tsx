import { SidebarLayout } from "@/features/ui/SidebarLayout"
import { ComingSoonSection } from "@/features/ui/ComingSoonSection"

export default function ProgramsPage() {
  return (
    <SidebarLayout>
      <ComingSoonSection
        title="Раздел программ"
        description="Раздел предназначен для структурирования образовательных программ, направлений и связей между курсами."
        points={[
          "Программы бакалавриата, магистратуры и PhD",
          "Связка программ с курсами и сообществами",
          "Маршруты обучения по компетенциям",
        ]}
      />
    </SidebarLayout>
  )
}
