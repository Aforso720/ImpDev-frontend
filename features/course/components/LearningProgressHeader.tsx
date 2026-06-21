import { CheckCircle2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import type { AdaptivePlanItemView } from "../adaptive.types"
import type { CourseProgressSummary } from "../course-progress.helpers"

type LearningProgressHeaderProps = {
  courseTitle: string
  progress: CourseProgressSummary
  currentItem: AdaptivePlanItemView | null
  completed?: boolean
}

export function LearningProgressHeader({
  courseTitle,
  progress,
  currentItem,
  completed = false,
}: LearningProgressHeaderProps) {
  const width = progress.totalBlocks > 0 ? `${Math.max(4, progress.percent)}%` : "0%"

  return (
    <Card className="border-border bg-card/95 text-card-foreground shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Прохождение курса</p>
            <h1 className="text-xl font-semibold text-foreground">{courseTitle}</h1>
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {completed
                ? "Все блоки курса завершены."
                : currentItem?.title
                  ? `Текущий блок: ${currentItem.title}`
                  : "Выберите доступный блок маршрута."}
            </p>
          </div>
          <Badge variant={completed ? "default" : "secondary"} className="w-fit gap-1">
            {completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
            {progress.percent}%
          </Badge>
        </div>

        <div className="h-2 rounded-full bg-muted">
          <div className="h-full rounded-full bg-success transition-all" style={{ width }} />
        </div>

        <p className="text-xs text-muted-foreground">
          Завершено {progress.completedBlocks} из {progress.totalBlocks} учебных блоков.
        </p>
      </CardContent>
    </Card>
  )
}
