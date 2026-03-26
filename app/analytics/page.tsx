import { SidebarLayout } from "@/features/ui/SidebarLayout"
import { ComingSoonSection } from "@/features/ui/ComingSoonSection"

export default function AnalyticsPage() {
  return (
    <SidebarLayout>
      <ComingSoonSection
        title="Факты и аналитика"
        description="В этом разделе появятся сводные показатели по университетам, курсам, активности сообществ и росту компетенций."
        points={[
          "Дашборд метрик по образовательной экосистеме",
          "Сравнение активности по университетам",
          "Динамика прохождения траекторий и курсов",
        ]}
      />
    </SidebarLayout>
  )
}
