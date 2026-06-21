"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useQueries, useQuery } from "@tanstack/react-query"
import { BookOpenCheck, GraduationCap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

import { AdaptiveService } from "../adaptive.service"
import { calculateCourseProgress } from "../course-progress.helpers"
import { CourseService } from "../course.service"
import { CourseCard } from "./CourseCard"

const STUDYING_LIMIT = 60

export function StudyingCoursesCatalog() {
  const coursesQuery = useQuery({
    queryKey: ["courses", "studying", { limit: STUDYING_LIMIT }],
    queryFn: () => CourseService.getAvailable({ page: 1, limit: STUDYING_LIMIT }),
  })

  const courses = useMemo(() => coursesQuery.data?.items ?? [], [coursesQuery.data?.items])
  const courseIds = useMemo(() => courses.map((course) => course.id), [courses])

  const statesQuery = useQuery({
    queryKey: ["adaptive", "course-states", "studying", courseIds],
    queryFn: () => AdaptiveService.getCourseStates(courseIds),
    enabled: courseIds.length > 0,
  })

  const stateMap = useMemo(
    () => new Map((statesQuery.data ?? []).map((state) => [state.courseId, state])),
    [statesQuery.data],
  )

  const studyingCourses = useMemo(
    () => courses.filter((course) => stateMap.get(course.id)?.enrolled),
    [courses, stateMap],
  )

  const planTargets = useMemo(
    () =>
      studyingCourses.flatMap((course) => {
        const adaptiveEnrollmentId = stateMap.get(course.id)?.adaptiveEnrollmentId
        if (!adaptiveEnrollmentId) return []
        return [{ courseId: course.id, adaptiveEnrollmentId }]
      }),
    [stateMap, studyingCourses],
  )

  const planQueries = useQueries({
    queries: planTargets.map((target) => ({
      queryKey: ["adaptive", "plans", "studying", target.adaptiveEnrollmentId],
      queryFn: () => AdaptiveService.getPlans(target.adaptiveEnrollmentId, { currentOnly: true }),
      staleTime: 60_000,
    })),
  })

  const progressMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateCourseProgress>>()

    planTargets.forEach((target, index) => {
      const plan = planQueries[index]?.data?.[0] ?? null
      map.set(target.courseId, calculateCourseProgress(plan))
    })

    return map
  }, [planQueries, planTargets])

  const isLoading = coursesQuery.isLoading || statesQuery.isLoading

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden border-0 bg-brand-deep text-white">
        <CardContent className="grid gap-4 p-6 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-nuri-accent/15 px-3 py-1 text-sm text-white">
              <GraduationCap className="h-4 w-4" />
              Мое обучение
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-white">Курсы, которые вы проходите</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/82">
              Здесь собраны начатые курсы, прогресс по adaptive plan и быстрый переход к следующему учебному блоку.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild firefly>
                <Link href="/courses">Найти новый курс</Link>
              </Button>
              <Button asChild variant="outline" className="border-nuri-accent/35 bg-nuri-accent/10 text-white hover:bg-nuri-accent/20 hover:text-white">
                <Link href="/courses/my">Авторские курсы</Link>
              </Button>
            </div>
          </div>

          <Card className="border-nuri-accent/20 bg-card/10 text-white shadow-none">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Начато</p>
              <p className="mt-2 text-3xl font-semibold text-white">{studyingCourses.length}</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-72 rounded-3xl" />
          ))}
        </div>
      ) : coursesQuery.isError || statesQuery.isError ? (
        <Card className="border-dashed border-destructive/40 bg-destructive/5">
          <CardContent className="p-6 text-sm text-destructive">
            Не удалось загрузить список изучаемых курсов.
          </CardContent>
        </Card>
      ) : studyingCourses.length === 0 ? (
        <Empty className="border-border bg-card/70">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpenCheck />
            </EmptyMedia>
            <EmptyTitle>Вы пока не начали обучение</EmptyTitle>
            <EmptyDescription>
              Откройте каталог, выберите курс и нажмите «Начать курс». После записи он появится здесь.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link href="/courses">Перейти в каталог</Link>
          </Button>
        </Empty>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {studyingCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              adaptiveState={stateMap.get(course.id)}
              progress={progressMap.get(course.id)}
              variant="studying"
            />
          ))}
        </div>
      )}
    </section>
  )
}
