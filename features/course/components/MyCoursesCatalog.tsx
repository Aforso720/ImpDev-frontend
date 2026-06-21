"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { FilePenLine, Layers3 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/format-date"

import { AdaptiveService } from "../adaptive.service"
import { CourseService } from "../course.service"
import type { CourseStatus } from "../course.types"

function statusTitle(status: CourseStatus | undefined) {
  switch (status) {
    case "DRAFT":
      return "Черновики"
    case "PUBLISHED":
      return "Опубликованные"
    case "ARCHIVED":
      return "Архив"
    default:
      return "Авторские курсы"
  }
}

type MyCoursesCatalogProps = {
  status?: string
}

export function MyCoursesCatalog({ status: rawStatus }: MyCoursesCatalogProps) {
  const status =
    rawStatus === "DRAFT" || rawStatus === "PUBLISHED" || rawStatus === "ARCHIVED"
      ? rawStatus
      : undefined

  const { data, isLoading, isError } = useQuery({
    queryKey: ["courses", "authored", { status }],
    queryFn: () => CourseService.getMyAuthored(status),
  })

  const items = useMemo(() => data ?? [], [data])
  const courseIds = useMemo(() => items.map((course) => course.id), [items])

  const adaptiveStatesQuery = useQuery({
    queryKey: ["adaptive", "course-states", "authored", courseIds],
    queryFn: () => AdaptiveService.getCourseStates(courseIds),
    enabled: courseIds.length > 0,
  })

  const adaptiveStateMap = useMemo(
    () => new Map((adaptiveStatesQuery.data ?? []).map((state) => [state.courseId, state])),
    [adaptiveStatesQuery.data],
  )

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden border-0 bg-brand-deep text-white">
        <CardContent className="grid gap-4 p-6 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <Badge variant="secondary" className="bg-nuri-accent/15 text-white hover:bg-nuri-accent/15">
              Управление курсами
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold text-white">{statusTitle(status)}</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/82">
              Здесь находятся курсы, которые вы создали или администрируете. Изучаемые курсы вынесены в «Мое обучение».
            </p>
          </div>

          <Card className="border-nuri-accent/20 bg-card/10 text-white shadow-none">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Количество</p>
              <p className="mt-2 text-3xl font-semibold text-white">{items.length}</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-3xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-sm text-destructive">
            Не удалось загрузить авторские курсы.
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Empty className="border-border bg-card/70">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FilePenLine />
            </EmptyMedia>
            <EmptyTitle>Список пуст</EmptyTitle>
            <EmptyDescription>
              В текущем статусе у вас пока нет авторских курсов. Следующий логичный шаг — добавить форму создания и редактирования.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((course) => (
            <Card key={course.id} className="border-border bg-card/85 text-card-foreground">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{course.status}</Badge>
                  <Badge variant="outline" className="gap-1">
                    <Layers3 className="h-3.5 w-3.5" />
                    {course.scope}
                  </Badge>
                  {adaptiveStateMap.get(course.id)?.adaptiveReady ? (
                    <Badge variant="outline">Adaptive-ready</Badge>
                  ) : null}
                  {adaptiveStateMap.get(course.id)?.adaptiveEnrollmentId ? (
                    <Badge variant="secondary">
                      {adaptiveStateMap.get(course.id)?.routeMode ?? "ADAPTIVE"}
                    </Badge>
                  ) : null}
                  {adaptiveStateMap.get(course.id)?.hasCurrentPlan ? (
                    <Badge>Plan {adaptiveStateMap.get(course.id)?.currentPlanItems ?? 0}</Badge>
                  ) : null}
                </div>
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <CardDescription>{course.slug}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Создан {formatDate(course.createdAt)}</p>
                <Link href={`/courses/${course.slug}`} className="text-sm font-medium text-primary">
                  Открыть курс
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
