import Link from "next/link"
import { Clock3, ExternalLink, ListChecks } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import type { AdaptivePlanItemView, AdaptivePlanView } from "../adaptive.types"
import { getPlanBlockItems } from "../course-progress.helpers"
import type { CourseDetail, CoursePracticeTask, CourseTheoryBlock } from "../course.types"
import { PracticeSubmissionForm } from "./PracticeSubmissionForm"

type LearningBlockContentProps = {
  course: CourseDetail
  plan: AdaptivePlanView | null
  currentItem: AdaptivePlanItemView | null
  onMarkComplete: () => void
  isCompleting?: boolean
  canMarkComplete?: boolean
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase()
}

function practiceDifficultyLabel(level: CoursePracticeTask["difficulty"]) {
  if (level === "EASY") return "Базовый"
  if (level === "MEDIUM") return "Средний"
  return "Продвинутый"
}

type ResolvedLearningContent =
  | { kind: "theory"; theory: CourseTheoryBlock }
  | { kind: "practice"; practice: CoursePracticeTask }
  | null

function findTheory(course: CourseDetail, currentItem: AdaptivePlanItemView | null): CourseTheoryBlock | null {
  const title = normalize(currentItem?.title)
  if (!title) return course.theory[0] ?? null
  return course.theory.find((item) => normalize(item.title) === title) ?? null
}

function findPractice(course: CourseDetail, currentItem: AdaptivePlanItemView | null): CoursePracticeTask | null {
  const title = normalize(currentItem?.title)
  if (!title) return null
  return course.practiceTasks.find((item) => normalize(item.title) === title) ?? null
}

function resolveContent(
  course: CourseDetail,
  plan: AdaptivePlanView | null,
  currentItem: AdaptivePlanItemView | null,
): ResolvedLearningContent {
  const practice = findPractice(course, currentItem)
  if (practice) return { kind: "practice", practice }

  const theory = findTheory(course, currentItem)
  if (theory) return { kind: "theory", theory }

  const orderedContent: ResolvedLearningContent[] = [
    ...course.theory
      .slice()
      .sort((left, right) => left.order - right.order)
      .map((item) => ({ kind: "theory" as const, theory: item })),
    ...course.practiceTasks
      .slice()
      .sort((left, right) => left.order - right.order)
      .map((item) => ({ kind: "practice" as const, practice: item })),
  ]

  const blocks = getPlanBlockItems(plan)
  const itemIndex = currentItem ? blocks.findIndex((item) => item.id === currentItem.id) : 0

  return orderedContent[itemIndex >= 0 ? itemIndex : 0] ?? null
}

export function LearningBlockContent({
  course,
  plan,
  currentItem,
  onMarkComplete,
  isCompleting = false,
  canMarkComplete = true,
}: LearningBlockContentProps) {
  const content = resolveContent(course, plan, currentItem)
  const practice = content?.kind === "practice" ? content.practice : null
  const theory = content?.kind === "theory" ? content.theory : null

  if (practice) {
    return (
      <Card className="border-border bg-card/95 text-card-foreground shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{practiceDifficultyLabel(practice.difficulty)}</Badge>
            <Badge>{practice.maxScore} баллов</Badge>
          </div>
          <CardTitle>{practice.title}</CardTitle>
          <CardDescription>Практическое задание курса. Отправьте решение и завершите блок.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/45 p-4 text-sm whitespace-pre-wrap text-muted-foreground">
            {practice.statementMd}
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {practice.timeLimitMs ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                <Clock3 className="h-3.5 w-3.5" />
                Лимит: {practice.timeLimitMs} ms
              </span>
            ) : null}
            {practice.memoryLimitMb ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                <ListChecks className="h-3.5 w-3.5" />
                Память: {practice.memoryLimitMb} MB
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {practice.externalRef ? (
              <Button asChild variant="outline">
                <Link href={practice.externalRef} target="_blank">
                  Открыть условие
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </div>

          <PracticeSubmissionForm taskId={practice.id} />
        </CardContent>
      </Card>
    )
  }

  if (theory) {
    return (
      <Card className="border-border bg-card/95 text-card-foreground shadow-sm">
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            Теория
          </Badge>
          <CardTitle>{theory.title}</CardTitle>
          <CardDescription>Учебный материал из программы курса.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border bg-muted/45 p-4 text-sm leading-7 whitespace-pre-wrap text-muted-foreground">
            {theory.contentMd}
          </div>
          <Button className="mt-4" type="button" disabled={!canMarkComplete || isCompleting} onClick={onMarkComplete}>
            {canMarkComplete ? (isCompleting ? "Сохраняем..." : "Отметить как изучено") : "Уже изучено"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-dashed border-border bg-card/95 text-card-foreground">
      <CardHeader>
        <Badge variant="outline" className="w-fit">
          Блок маршрута
        </Badge>
        <CardTitle>{currentItem?.title || "Учебный блок"}</CardTitle>
        <CardDescription>
          Этот блок есть в adaptive plan, но его контент пока не удалось сопоставить с теорией или практикой.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-dashed border-border bg-muted/45 p-4 text-sm text-muted-foreground">
          Можно завершить шаг в маршруте или перейти к соседнему блоку.
        </div>
      </CardContent>
    </Card>
  )
}
