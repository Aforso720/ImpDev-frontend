"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { AdaptiveService } from "../adaptive.service"
import { CourseService } from "../course.service"
import {
  calculateCourseProgress,
  getCurrentBlockItem,
  getLearningHref,
  getNextBlockItem,
  getPreviousBlockItem,
  isCourseCompleted,
  isDonePlanItem,
  willCompleteCourse,
} from "../course-progress.helpers"
import { CourseAdaptivePanel } from "./CourseAdaptivePanel"
import { LearningBlockContent } from "./LearningBlockContent"
import { LearningLayout } from "./LearningLayout"
import { LearningNavigation } from "./LearningNavigation"

type CourseLearningPageProps = {
  slug: string
  blockId?: string
}

function parseError(error: unknown) {
  const data = error as { message?: string; response?: { data?: { message?: string | string[] } } }
  if (Array.isArray(data?.response?.data?.message)) return data.response.data.message.join(", ")
  if (typeof data?.response?.data?.message === "string") return data.response.data.message
  if (error instanceof Error) return error.message
  return "Не удалось выполнить действие"
}

export function CourseLearningPage({ slug, blockId }: CourseLearningPageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const courseQuery = useQuery({
    queryKey: ["course", "slug", slug],
    queryFn: () => CourseService.getBySlug(slug),
    enabled: Boolean(slug),
  })

  const course = courseQuery.data

  const adaptiveStateQuery = useQuery({
    queryKey: ["adaptive", "course-state", "learn", course?.id],
    enabled: Boolean(course?.id),
    queryFn: async () => {
      if (!course?.id) return null
      const rows = await AdaptiveService.getCourseStates([course.id])
      return rows[0] ?? null
    },
  })

  const adaptiveState = adaptiveStateQuery.data
  const adaptiveEnrollmentId = adaptiveState?.adaptiveEnrollmentId ?? null

  const planQuery = useQuery({
    queryKey: ["adaptive", "plans", "learn", adaptiveEnrollmentId],
    queryFn: () => AdaptiveService.getPlans(adaptiveEnrollmentId as string, { currentOnly: true }),
    enabled: Boolean(adaptiveEnrollmentId),
  })

  const currentPlan = planQuery.data?.[0] ?? null

  const currentItem = useMemo(() => getCurrentBlockItem(currentPlan, blockId), [blockId, currentPlan])
  const previousItem = useMemo(() => getPreviousBlockItem(currentPlan, currentItem), [currentItem, currentPlan])
  const nextItem = useMemo(() => getNextBlockItem(currentPlan, currentItem), [currentItem, currentPlan])
  const progress = useMemo(() => calculateCourseProgress(currentPlan), [currentPlan])
  const courseCompleted = useMemo(() => isCourseCompleted(currentPlan), [currentPlan])
  const canCompleteCurrentItem = Boolean(currentItem && !isDonePlanItem(currentItem))

  useEffect(() => {
    if (!blockId && course?.slug && currentItem) {
      router.replace(getLearningHref(course.slug, currentItem))
    }
  }, [blockId, course?.slug, currentItem, router])

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!adaptiveEnrollmentId) throw new Error("Маршрут не найден")
      if (!currentItem) throw new Error("Учебный блок не выбран")
      if (!course) throw new Error("Курс не найден")

      const finishCourse = willCompleteCourse(currentPlan, currentItem)

      await AdaptiveService.createProgressEvent({
        adaptiveEnrollmentId,
        eventType: "BLOCK_COMPLETED",
        planItemId: currentItem.id,
        blockId: currentItem.blockId ?? undefined,
        idempotencyKey: `${currentItem.id}:BLOCK_COMPLETED:${Date.now()}`,
      })

      if (finishCourse) {
        await CourseService.complete(course.id)
      }

      return { finishCourse }
    },
    onSuccess: async ({ finishCourse }) => {
      toast.success(finishCourse ? "Курс завершен" : "Шаг отмечен как завершенный")
      await queryClient.invalidateQueries({ queryKey: ["adaptive"] })
      await queryClient.invalidateQueries({ queryKey: ["course", "slug", slug] })
    },
    onError: (error) => toast.error(parseError(error)),
  })

  if (courseQuery.isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-28 rounded-3xl" />
        <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
          <Skeleton className="h-[560px] rounded-3xl" />
          <Skeleton className="h-[560px] rounded-3xl" />
        </div>
      </section>
    )
  }

  if (courseQuery.isError || !course) {
    return (
      <Card className="border-dashed">
        <CardContent className="space-y-3 p-6">
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
            <AlertCircle className="h-5 w-5" />
            Курс не загрузился
          </h1>
          <p className="text-sm text-muted-foreground">
            Курс может быть недоступен текущему пользователю или сервис временно не отвечает.
          </p>
          <Button onClick={() => router.push("/courses")}>Вернуться в каталог</Button>
        </CardContent>
      </Card>
    )
  }

  if (adaptiveStateQuery.isLoading || planQuery.isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-28 rounded-3xl" />
        <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
          <Skeleton className="h-[560px] rounded-3xl" />
          <Skeleton className="h-[560px] rounded-3xl" />
        </div>
      </section>
    )
  }

  if (!adaptiveState?.enrolled || !adaptiveEnrollmentId || !currentPlan) {
    return (
      <section className="space-y-4">
        <Card className="border-border bg-card/95 text-card-foreground">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Курс еще не начат</p>
              <h1 className="mt-1 text-2xl font-semibold text-foreground">{course.title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Для режима прохождения нужно записаться на курс и собрать персональный маршрут. Это займет один шаг.
              </p>
            </div>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/courses/${course.slug}`}>К описанию</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border bg-card text-card-foreground">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Ниже можно записаться на курс или запустить adaptive-маршрут. После этого откроется структура курса и первый доступный блок.
            </p>
          </CardContent>
        </Card>
        <CourseAdaptivePanel courseId={course.id} focusModeDefault={false} />
      </section>
    )
  }

  if (blockId && !currentItem) {
    return (
      <LearningLayout
        course={course}
        plan={currentPlan}
        currentItem={null}
        progress={progress}
        navigation={
          <div className="rounded-2xl border border-border bg-card/90 p-3">
            <Button asChild variant="outline">
              <Link href={`/courses/${course.slug}/learn`}>К первому доступному блоку</Link>
            </Button>
          </div>
        }
      >
        <Card className="border-dashed border-destructive/40 bg-destructive/5">
          <CardContent className="space-y-3 p-6">
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-destructive">
              <AlertCircle className="h-5 w-5" />
              Блок не найден
            </h1>
            <p className="text-sm text-destructive/80">
              В текущем adaptive plan нет блока с идентификатором `{blockId}`. Откройте первый доступный блок маршрута.
            </p>
          </CardContent>
        </Card>
      </LearningLayout>
    )
  }

  if (!currentItem) {
    return (
      <LearningLayout
        course={course}
        plan={currentPlan}
        currentItem={null}
        progress={progress}
        navigation={
          <Button asChild variant="outline">
            <Link href={`/courses/${course.slug}`}>К описанию курса</Link>
          </Button>
        }
      >
        <Card className="border-dashed border-border bg-card text-card-foreground">
          <CardContent className="space-y-2 p-6">
            <h1 className="text-2xl font-semibold text-foreground">Нет доступного следующего блока</h1>
            <p className="text-sm text-muted-foreground">
              В текущем маршруте нет открытых учебных блоков. Обновите adaptive plan или вернитесь к описанию курса.
            </p>
          </CardContent>
        </Card>
      </LearningLayout>
    )
  }

  return (
    <LearningLayout
      course={course}
      plan={currentPlan}
      currentItem={currentItem}
      progress={progress}
      navigation={
        <LearningNavigation
          slug={course.slug}
          previousItem={previousItem}
          nextItem={nextItem}
          onComplete={() => completeMutation.mutate()}
          isCompleting={completeMutation.isPending}
          canComplete={canCompleteCurrentItem}
        />
      }
    >
      {courseCompleted ? (
        <Card className="border-success/35 bg-success/10">
          <CardContent className="flex flex-col gap-3 p-4 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Курс завершен
            </span>
            <Button asChild variant="outline">
              <Link href={`/courses/${course.slug}`}>Вернуться к описанию</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
      <LearningBlockContent
        course={course}
        plan={currentPlan}
        currentItem={currentItem}
        onMarkComplete={() => completeMutation.mutate()}
        isCompleting={completeMutation.isPending}
        canMarkComplete={canCompleteCurrentItem}
      />
    </LearningLayout>
  )
}
