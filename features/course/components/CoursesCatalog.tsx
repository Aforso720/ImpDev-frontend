"use client"

import Link from "next/link"
import { startTransition, useDeferredValue, useMemo, useState, type ReactNode } from "react"
import { useQueries, useQuery } from "@tanstack/react-query"
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Filter,
  GraduationCap,
  Layers3,
  Search,
  Sparkles,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import { AdaptiveService } from "../adaptive.service"
import { calculateCourseProgress } from "../course-progress.helpers"
import { CourseService } from "../course.service"
import type { CourseScopeFilter } from "../course.types"
import { CourseCard } from "./CourseCard"

const PAGE_SIZE = 6

const scopeMeta: Record<CourseScopeFilter, { label: string; icon: ReactNode }> = {
  ALL: { label: "Все", icon: <Layers3 className="h-4 w-4" /> },
  PUBLIC: { label: "Публичные", icon: <BookOpen className="h-4 w-4" /> },
  UNIVERSITY: { label: "Университет", icon: <GraduationCap className="h-4 w-4" /> },
  TEAM: { label: "Команда", icon: <Users className="h-4 w-4" /> },
}

export function CoursesCatalog() {
  const [query, setQuery] = useState("")
  const [scope, setScope] = useState<CourseScopeFilter>("ALL")
  const [page, setPage] = useState(1)
  const deferredQuery = useDeferredValue(query)

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["courses", "catalog", { page, scope, q: deferredQuery }],
    queryFn: () =>
      CourseService.getAvailable({
        page,
        limit: PAGE_SIZE,
        q: deferredQuery,
        scope,
      }),
  })

  const items = useMemo(() => data?.items ?? [], [data?.items])
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const courseIds = useMemo(() => items.map((course) => course.id), [items])

  const adaptiveStatesQuery = useQuery({
    queryKey: ["adaptive", "course-states", "catalog", courseIds],
    queryFn: () => AdaptiveService.getCourseStates(courseIds),
    enabled: courseIds.length > 0,
  })

  const adaptiveStateMap = useMemo(
    () => new Map((adaptiveStatesQuery.data ?? []).map((state) => [state.courseId, state])),
    [adaptiveStatesQuery.data],
  )

  const planTargets = useMemo(
    () =>
      items.flatMap((course) => {
        const adaptiveEnrollmentId = adaptiveStateMap.get(course.id)?.adaptiveEnrollmentId
        if (!adaptiveEnrollmentId) return []
        return [{ courseId: course.id, adaptiveEnrollmentId }]
      }),
    [adaptiveStateMap, items],
  )

  const planQueries = useQueries({
    queries: planTargets.map((target) => ({
      queryKey: ["adaptive", "plans", "catalog", target.adaptiveEnrollmentId],
      queryFn: () => AdaptiveService.getPlans(target.adaptiveEnrollmentId, { currentOnly: true }),
      staleTime: 60_000,
    })),
  })

  const progressByCourse = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateCourseProgress>>()

    planTargets.forEach((target, index) => {
      const progress = calculateCourseProgress(planQueries[index]?.data?.[0])
      map.set(target.courseId, progress)
    })

    return map
  }, [planQueries, planTargets])

  const continueCourses = useMemo(() => {
    return items
      .map((course) => {
        const state = adaptiveStateMap.get(course.id)
        const progress = progressByCourse.get(course.id)

        let rank = 0
        if (progress && progress.totalBlocks > 0) rank += 120 + progress.percent
        if (state?.enrolled) rank += 70
        if (state?.adaptiveReady) rank += 20

        return { course, state, progress, rank }
      })
      .filter((entry) => entry.rank > 0)
      .sort((a, b) => b.rank - a.rank)
      .slice(0, 3)
  }, [adaptiveStateMap, items, progressByCourse])

  const recommendedCourses = useMemo(
    () =>
      items.slice(0, 3).map((course) => ({
        course,
        state: adaptiveStateMap.get(course.id),
        progress: progressByCourse.get(course.id),
      })),
    [adaptiveStateMap, items, progressByCourse],
  )

  const hasContinue = continueCourses.length > 0
  const spotlightCourses = hasContinue ? continueCourses : recommendedCourses

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden border-0 bg-brand-deep text-white">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.6fr_1fr] lg:p-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-nuri-accent/15 text-white hover:bg-nuri-accent/15">
              Каталог обучения
            </Badge>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">Курсы с понятным следующим шагом</h1>
            <p className="max-w-3xl text-sm text-white/82 sm:text-base">
              Здесь удобно выбирать курс, видеть свой прогресс и сразу переходить к действию: начать, продолжить или вернуться к практике.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild firefly>
                <Link href="/courses/studying">Мое обучение</Link>
              </Button>
              <Button asChild variant="outline" className="border-nuri-accent/35 bg-nuri-accent/10 text-white hover:bg-nuri-accent/20 hover:text-white">
                <Link href="/">Вернуться на главную</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <Card className="border-nuri-accent/20 bg-card/10 text-white shadow-none">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">Найдено курсов</p>
                <p className="mt-2 text-3xl font-semibold text-white">{total}</p>
              </CardContent>
            </Card>
            <Card className="border-nuri-accent/20 bg-card/10 text-white shadow-none">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">Страница</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {page}/{totalPages}
                </p>
              </CardContent>
            </Card>
            <Card className="border-nuri-accent/20 bg-card/10 text-white shadow-none">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">Фильтр</p>
                <p className="mt-2 text-xl font-semibold text-white">{scopeMeta[scope].label}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card text-card-foreground">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Filter className="h-5 w-5" />
                Поиск и фильтры
              </CardTitle>
              <CardDescription>Найдите курс по теме и сузьте каталог по типу доступа.</CardDescription>
            </div>

            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  startTransition(() => setPage(1))
                }}
                className="bg-background pl-9"
                placeholder="Поиск по названию и описанию..."
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(Object.keys(scopeMeta) as CourseScopeFilter[]).map((scopeKey) => (
              <Button
                key={scopeKey}
                type="button"
                variant={scope === scopeKey ? "default" : "outline"}
                className="gap-2"
                onClick={() => {
                  startTransition(() => {
                    setScope(scopeKey)
                    setPage(1)
                  })
                }}
              >
                {scopeMeta[scopeKey].icon}
                {scopeMeta[scopeKey].label}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      <Card className="border-border bg-card text-card-foreground">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5" />
              {hasContinue ? "Продолжить" : "Рекомендовано начать"}
            </CardTitle>
            <CardDescription>
              {hasContinue
                ? "Курсы на текущей странице, где уже есть персональный маршрут или активный прогресс."
                : "Подборка курсов, с которых удобно начать обучение."}
            </CardDescription>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/courses/studying">Открыть мое обучение</Link>
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : spotlightCourses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/45 p-4 text-sm text-muted-foreground">
              На этой странице пока нет курсов для блока продолжения. Попробуйте другой фильтр или поиск.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {spotlightCourses.map(({ course, state, progress }) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  adaptiveState={state}
                  progress={progress}
                  variant="spotlight"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="h-5 w-5" />
            Каталог курсов
          </CardTitle>
          <CardDescription>
            {isFetching ? "Обновляем список..." : `Показано ${items.length} из ${total}.`}
            {" "}
            {deferredQuery.trim() ? `Поиск: "${deferredQuery.trim()}".` : "Поиск не задан."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="space-y-4 p-5">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card className="border-dashed border-destructive/40 bg-destructive/5">
              <CardContent className="p-6 text-sm text-destructive">
                Не удалось загрузить каталог курсов. Проверьте соединение и повторите попытку.
              </CardContent>
            </Card>
          ) : items.length === 0 ? (
            <Empty className="border-border bg-card/70">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen />
                </EmptyMedia>
                <EmptyTitle>Курсы пока не найдены</EmptyTitle>
                <EmptyDescription>
                  Измените фильтр доступа или попробуйте другой поисковый запрос.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {items.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    adaptiveState={adaptiveStateMap.get(course.id)}
                    progress={progressByCourse.get(course.id)}
                  />
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={page <= 1}
                  onClick={() => startTransition(() => setPage((current) => Math.max(1, current - 1)))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Назад
                </Button>

                <div className="text-sm text-muted-foreground">
                  Страница <span className="font-semibold text-foreground">{page}</span> из{" "}
                  <span className="font-semibold text-foreground">{totalPages}</span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={page >= totalPages}
                  onClick={() => startTransition(() => setPage((current) => Math.min(totalPages, current + 1)))}
                >
                  Вперед
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
