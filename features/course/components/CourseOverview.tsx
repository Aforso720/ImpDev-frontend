"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Layers3,
  ListChecks,
  PlayCircle,
  Route,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AdaptiveService } from "@/features/course/adaptive.service"
import { formatDate } from "@/lib/format-date"

import { CourseService } from "../course.service"
import { calculateCourseProgress, getLearningHref, isCourseCompleted } from "../course-progress.helpers"
import type { CourseDetail, CoursePracticeTask } from "../course.types"
import { CourseProgress } from "./CourseProgress"

function scopeLabel(scope: CourseDetail["scope"]) {
  if (scope === "PUBLIC") return "Публичный курс"
  if (scope === "UNIVERSITY") return "Университетский курс"
  return "Командный курс"
}

function statusLabel(status: CourseDetail["status"]) {
  if (status === "DRAFT") return "Черновик"
  if (status === "PUBLISHED") return "Опубликован"
  return "Архив"
}

function practiceDifficultyLabel(level: CoursePracticeTask["difficulty"]) {
  if (level === "EASY") return "Базовый"
  if (level === "MEDIUM") return "Средний"
  return "Продвинутый"
}

function courseLevelLabel(course: CourseDetail) {
  if (course.practiceTasks.some((task) => task.difficulty === "HARD")) return "Продвинутый"
  if (course.practiceTasks.some((task) => task.difficulty === "MEDIUM")) return "Средний"
  return "Базовый"
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} мин`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest > 0 ? `${hours} ч ${rest} мин` : `${hours} ч`
}

function buildLearningOutcomes(course: CourseDetail) {
  const theoryOutcomes = course.theory.slice(0, 4).map((item) => `Разобраться в теме «${item.title}»`)
  const practiceOutcome =
    course.practiceTasks.length > 0
      ? [`Закрепить материал на ${course.practiceTasks.length} практических заданиях`]
      : []

  const outcomes = [...theoryOutcomes, ...practiceOutcome]

  if (outcomes.length > 0) return outcomes.slice(0, 5)

  return [
    "Познакомиться с основными материалами курса",
    "Пройти учебные блоки в удобном темпе",
    "Зафиксировать прогресс в персональном маршруте",
  ]
}

export function CourseOverview({ slug }: { slug: string }) {
  const { data: course, isLoading, isError } = useQuery({
    queryKey: ["course", "slug", slug],
    queryFn: () => CourseService.getBySlug(slug),
    enabled: !!slug,
  })

  const { data: adaptiveState, isLoading: isAdaptiveStateLoading } = useQuery({
    queryKey: ["adaptive", "course-state", "overview", course?.id],
    enabled: Boolean(course?.id),
    queryFn: async () => {
      if (!course?.id) return null
      const rows = await AdaptiveService.getCourseStates([course.id])
      return rows[0] ?? null
    },
  })

  const { data: currentPlans } = useQuery({
    queryKey: ["adaptive", "plans", "overview", adaptiveState?.adaptiveEnrollmentId],
    enabled: Boolean(adaptiveState?.adaptiveEnrollmentId),
    queryFn: () => AdaptiveService.getPlans(adaptiveState?.adaptiveEnrollmentId as string, { currentOnly: true }),
  })

  const currentPlan = currentPlans?.[0] ?? null
  const progress = useMemo(() => (currentPlan ? calculateCourseProgress(currentPlan) : null), [currentPlan])

  if (isLoading) {
    return (
      <section className="space-y-5">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-[520px] rounded-3xl" />
          <Skeleton className="h-[520px] rounded-3xl" />
        </div>
      </section>
    )
  }

  if (isError || !course) {
    return (
      <Card className="border-dashed border-destructive/40 bg-destructive/5">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-1 h-5 w-5 text-destructive" />
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Курс не найден</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Курс может быть недоступен, снят с публикации или сервис временно не отвечает.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/courses">Вернуться в каталог</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const estimatedMinutes = course.theory.length * 12 + course.practiceTasks.length * 20
  const totalBlocks = course.theory.length + course.practiceTasks.length
  const learningOutcomes = buildLearningOutcomes(course)
  const started = Boolean(adaptiveState?.enrolled)
  const completed = isCourseCompleted(currentPlan)
  const nextItem = progress?.currentItem ?? null
  const actionHref = getLearningHref(course.slug, started ? nextItem : null)
  const actionLabel = started ? (completed ? "Открыть курс" : "Продолжить обучение") : "Начать курс"

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden border-0 bg-brand-deep text-white">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-nuri-accent/15 text-white hover:bg-nuri-accent/15">
                {scopeLabel(course.scope)}
              </Badge>
              <Badge variant="outline" className="border-nuri-accent/35 text-white">
                {statusLabel(course.status)}
              </Badge>
              {started ? (
                <Badge variant="secondary" className="bg-nuri-accent/15 text-white hover:bg-nuri-accent/15">
                  {completed ? "Курс завершен" : "Курс начат"}
                </Badge>
              ) : null}
            </div>

            <div>
              <h1 className="max-w-4xl text-3xl font-semibold text-white sm:text-4xl">{course.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/82 sm:text-base">
                {course.description || "Описание курса скоро появится."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild firefly>
                <Link href={actionHref}>
                  <PlayCircle className="h-4 w-4" />
                  {actionLabel}
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-nuri-accent/35 bg-nuri-accent/10 text-white hover:bg-nuri-accent/20 hover:text-white">
                <Link href="/courses">К каталогу</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="border-nuri-accent/20 bg-card/10 text-white shadow-none">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">Уровень</p>
                <p className="mt-2 text-2xl font-semibold text-white">{courseLevelLabel(course)}</p>
              </CardContent>
            </Card>
            <Card className="border-nuri-accent/20 bg-card/10 text-white shadow-none">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">Длительность</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formatDuration(estimatedMinutes)}</p>
                <p className="text-xs text-white/70">{totalBlocks} учебных блоков</p>
              </CardContent>
            </Card>
            {started ? (
              <Card className="border-nuri-accent/20 bg-card/10 text-white shadow-none sm:col-span-2 lg:col-span-1">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">Прогресс</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{progress?.percent ?? 0}%</p>
                  <p className="text-xs text-white/70">
                    {progress?.completedBlocks ?? 0}/{progress?.totalBlocks ?? 0} шагов
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card className="border-border bg-card/90 text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Чему вы научитесь
              </CardTitle>
              <CardDescription>Коротко о результате после прохождения курса.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {learningOutcomes.map((outcome) => (
                  <div key={outcome} className="flex gap-3 rounded-xl border border-border bg-muted/45 p-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="text-muted-foreground">{outcome}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/90 text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenCheck className="h-5 w-5" />
                Программа курса
              </CardTitle>
              <CardDescription>Материалы открываются в режиме прохождения курса.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.theory.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/45 p-4 text-sm text-muted-foreground">
                  Теоретические блоки пока не добавлены.
                </div>
              ) : (
                course.theory.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-xl border border-border bg-muted/45 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-deep text-sm font-semibold text-white">
                      {item.order}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.contentMd}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card/90 text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers3 className="h-5 w-5" />
                Практические задания
              </CardTitle>
              <CardDescription>Практика доступна внутри режима прохождения.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.practiceTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/45 p-4 text-sm text-muted-foreground">
                  В этом курсе пока нет практических заданий. Можно проходить теоретические блоки и фиксировать прогресс.
                </div>
              ) : (
                course.practiceTasks.map((task) => (
                  <div key={task.id} className="rounded-xl border border-border bg-muted/45 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{task.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.statementMd}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{practiceDifficultyLabel(task.difficulty)}</Badge>
                        <Badge>{task.maxScore} баллов</Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {task.timeLimitMs ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {task.timeLimitMs} ms
                        </span>
                      ) : null}
                      {task.memoryLimitMb ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                          <ListChecks className="h-3.5 w-3.5" />
                          {task.memoryLimitMb} MB
                        </span>
                      ) : null}
                      {task.externalRef ? (
                        <Button asChild size="xs" variant="outline">
                          <Link href={task.externalRef} target="_blank">
                            Условие
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
          <Card className="border-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Route className="h-4 w-4" />
                Старт обучения
              </CardTitle>
              <CardDescription>
                {isAdaptiveStateLoading
                  ? "Проверяем состояние курса..."
                  : started
                    ? "Продолжите с последнего активного шага."
                    : "Откройте режим прохождения, чтобы записаться и собрать маршрут."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {started ? <CourseProgress progress={progress} /> : null}
              {started && nextItem?.title ? (
                <div className="rounded-xl border border-border bg-muted/45 p-3 text-sm">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Следующий шаг</p>
                  <p className="mt-1 font-medium text-foreground">{nextItem.title}</p>
                </div>
              ) : null}
              <Button asChild className="w-full">
                <Link href={actionHref}>{actionLabel}</Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Автор: {course.author.name}. Обновлено {formatDate(course.updatedAt)}.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-base">В курсе</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-muted/45 p-3">
                <span className="text-muted-foreground">Теория</span>
                <span className="font-medium text-foreground">{course.theory.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/45 p-3">
                <span className="text-muted-foreground">Практика</span>
                <span className="font-medium text-foreground">{course.practiceTasks.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/45 p-3">
                <span className="text-muted-foreground">Формат</span>
                <span className="font-medium text-foreground">Adaptive</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  )
}
