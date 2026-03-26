"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { FilePenLine, Layers3 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/format-date"

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
      return "Мои курсы"
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

  const items = data ?? []

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden border-0 bg-brand-panel">
        <CardContent className="grid gap-4 p-6 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <Badge variant="secondary" className="bg-white/12 text-ink-inverse hover:bg-white/12">
              Авторский раздел
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold text-ink-inverse">{statusTitle(status)}</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-inverse/80">
              Страница строится на `/course/my/authored` и фильтруется по status из query string.
            </p>
          </div>

          <Card className="bg-white/10 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-inverse/60">Количество</p>
              <p className="mt-2 text-3xl font-semibold text-ink-inverse">{items.length}</p>
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
        <Empty className="border-brand-soft bg-white/70">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FilePenLine />
            </EmptyMedia>
            <EmptyTitle>Список пуст</EmptyTitle>
            <EmptyDescription>
              В текущем статусе у тебя пока нет курсов. Следующий логичный шаг — добавить форму создания и редактирования.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((course) => (
            <Card key={course.id} className="border-brand-soft bg-white/80">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{course.status}</Badge>
                  <Badge variant="outline" className="gap-1">
                    <Layers3 className="h-3.5 w-3.5" />
                    {course.scope}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <CardDescription>{course.slug}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-ink-soft">Создан {formatDate(course.createdAt)}</p>
                <Link href={`/courses/${course.slug}`} className="text-sm font-medium text-brand-strong">
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
