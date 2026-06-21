import { Badge } from "@/components/ui/badge"

import type { CourseProgressSummary } from "../course-progress.helpers"

type CourseProgressProps = {
  progress: CourseProgressSummary | null | undefined
  compact?: boolean
}

export function CourseProgress({ progress, compact = false }: CourseProgressProps) {
  const percent = progress?.percent ?? 0
  const width = `${Math.max(progress ? 6 : 0, percent)}%`

  return (
    <div className="space-y-2 rounded-xl border border-border bg-muted/35 p-3">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {progress && progress.totalBlocks > 0
            ? `${progress.completedBlocks}/${progress.totalBlocks} шагов выполнено`
            : "Прогресс появится после старта"}
        </span>
        <Badge variant="secondary">{percent}%</Badge>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className="h-full rounded-full bg-success transition-all" style={{ width }} />
      </div>
      {!compact && progress?.currentItem?.title ? (
        <p className="line-clamp-1 text-xs text-muted-foreground">Текущий шаг: {progress.currentItem.title}</p>
      ) : null}
    </div>
  )
}
