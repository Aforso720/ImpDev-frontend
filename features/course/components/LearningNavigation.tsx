import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { AdaptivePlanItemView } from "../adaptive.types"
import { getLearningHref } from "../course-progress.helpers"

type LearningNavigationProps = {
  slug: string
  previousItem: AdaptivePlanItemView | null
  nextItem: AdaptivePlanItemView | null
  onComplete: () => void
  isCompleting?: boolean
  canComplete?: boolean
}

export function LearningNavigation({
  slug,
  previousItem,
  nextItem,
  onComplete,
  isCompleting = false,
  canComplete = true,
}: LearningNavigationProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/95 p-3 text-card-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <Button asChild variant="outline">
        <Link href={`/courses/${slug}`}>
          <ArrowLeft className="h-4 w-4" />
          К описанию
        </Link>
      </Button>

      <div className="flex flex-col gap-2 sm:flex-row">
        {previousItem ? (
          <Button asChild variant="outline">
            <Link href={getLearningHref(slug, previousItem)}>Назад</Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            Назад
          </Button>
        )}
        <Button type="button" onClick={onComplete} disabled={!canComplete || isCompleting}>
          <CheckCircle2 className="h-4 w-4" />
          {isCompleting ? "Сохраняем..." : "Завершить"}
        </Button>
        {nextItem ? (
          <Button asChild variant="outline">
            <Link href={getLearningHref(slug, nextItem)}>
              Следующий блок
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div className="flex flex-col gap-1">
            <Button variant="outline" disabled>
              Следующий блок
              <ArrowRight className="h-4 w-4" />
            </Button>
            <span className="text-center text-xs text-muted-foreground">Следующего блока нет</span>
          </div>
        )}
      </div>
    </div>
  )
}
