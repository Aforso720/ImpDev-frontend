import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/format-date"

import type { AdaptiveCourseState } from "../adaptive.types"
import type { CourseProgressSummary } from "../course-progress.helpers"
import type { CourseListItem } from "../course.types"
import { ContinueLearningButton } from "./ContinueLearningButton"
import { CourseProgress } from "./CourseProgress"

type CourseCardProps = {
  course: CourseListItem
  adaptiveState?: AdaptiveCourseState | null
  progress?: CourseProgressSummary | null
  variant?: "catalog" | "spotlight" | "studying"
}

function scopeLabel(scope: CourseListItem["scope"]) {
  if (scope === "PUBLIC") return "Публичный"
  if (scope === "UNIVERSITY") return "Университетский"
  return "Командный"
}

function routeModeLabel(mode: AdaptiveCourseState["routeMode"]) {
  if (mode === "STRICT") return "Строгий ритм"
  if (mode === "RECOVERY") return "Восстановление"
  if (mode === "ADAPTIVE") return "Персональный маршрут"
  return "Маршрут не выбран"
}

function trimText(value: string, max = 150) {
  if (!value) return "Описание курса скоро появится."
  if (value.length <= max) return value
  return `${value.slice(0, max).trim()}...`
}

export function CourseCard({ course, adaptiveState, progress, variant = "catalog" }: CourseCardProps) {
  const started = Boolean(adaptiveState?.enrolled)
  const completed = Boolean(progress && progress.totalBlocks > 0 && progress.remainingBlocks === 0)
  const currentItem = progress?.currentItem ?? null
  const descriptionMax = variant === "spotlight" ? 102 : 160

  return (
    <Card className="flex h-full flex-col border-border bg-card/85 text-card-foreground">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{scopeLabel(course.scope)}</Badge>
            {completed ? <Badge>Завершен</Badge> : null}
            {started && !completed ? <Badge variant="secondary">Начат</Badge> : null}
            {!started ? <Badge variant="secondary">Не начат</Badge> : null}
            {adaptiveState?.routeMode ? <Badge>{routeModeLabel(adaptiveState.routeMode)}</Badge> : null}
          </div>

          <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{course.title}</h3>
          <p className="line-clamp-4 text-sm text-muted-foreground">{trimText(course.description, descriptionMax)}</p>
        </div>

        <CourseProgress progress={progress} compact={variant !== "studying"} />

        {variant !== "spotlight" ? (
          <div className="rounded-xl bg-muted/55 p-3 text-sm">
            <p className="font-medium text-foreground">{course.author.name}</p>
            <p className="text-muted-foreground">Добавлен {formatDate(course.createdAt)}</p>
          </div>
        ) : null}

        {variant === "studying" && currentItem?.title ? (
          <div className="rounded-xl border border-border bg-muted/55 p-3 text-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Последний активный блок</p>
            <p className="mt-1 line-clamp-2 font-medium text-foreground">{currentItem.title}</p>
          </div>
        ) : null}

        <div className={started ? "mt-auto grid gap-2 sm:grid-cols-2" : "mt-auto"}>
          <Button asChild variant={started ? "outline" : "default"} className="w-full">
            <Link href={`/courses/${course.slug}`}>Подробнее</Link>
          </Button>
          {started ? (
            <ContinueLearningButton slug={course.slug} item={currentItem} label="Продолжить" className="w-full" />
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
