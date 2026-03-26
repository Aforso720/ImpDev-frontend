"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { BookOpenCheck, Clock3, ExternalLink, Layers3, Trophy, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/format-date"

import { CourseService } from "../course.service"

function scopeLabel(scope: "PUBLIC" | "UNIVERSITY" | "TEAM") {
  switch (scope) {
    case "PUBLIC":
      return "Публичный"
    case "UNIVERSITY":
      return "Университетский"
    case "TEAM":
      return "Командный"
  }
}

function statusLabel(status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
  switch (status) {
    case "DRAFT":
      return "Черновик"
    case "PUBLISHED":
      return "Опубликован"
    case "ARCHIVED":
      return "Архив"
  }
}

export function CourseOverview({ slug }: { slug: string }) {
  const { data: course, isLoading, isError } = useQuery({
    queryKey: ["course", "slug", slug],
    queryFn: () => CourseService.getBySlug(slug),
    enabled: !!slug,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Skeleton className="h-[420px] w-full rounded-3xl" />
          <Skeleton className="h-[420px] w-full rounded-3xl" />
        </div>
      </div>
    )
  }

  if (isError || !course) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6">
          <h1 className="text-2xl font-semibold text-ink-strong">Курс не загрузился</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Либо курс недоступен текущему пользователю, либо API вернул ошибку.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden border-0 bg-brand-panel">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-white/12 text-ink-inverse hover:bg-white/12">
                {scopeLabel(course.scope)}
              </Badge>
              <Badge variant="outline" className="border-white/30 text-ink-inverse">
                {statusLabel(course.status)}
              </Badge>
            </div>

            <div>
              <h1 className="text-3xl font-semibold text-ink-inverse sm:text-4xl">{course.title}</h1>
              <p className="mt-3 max-w-3xl text-sm text-ink-inverse/80 sm:text-base">
                {course.description}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <Card className="bg-white/10 shadow-none">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink-inverse/60">Автор</p>
                <p className="mt-2 text-lg font-semibold text-ink-inverse">{course.author.name}</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 shadow-none">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink-inverse/60">Теория</p>
                <p className="mt-2 text-3xl font-semibold text-ink-inverse">{course.theory.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 shadow-none">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink-inverse/60">Практика</p>
                <p className="mt-2 text-3xl font-semibold text-ink-inverse">{course.practiceTasks.length}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5" />
              Теоретические блоки
            </CardTitle>
            <CardDescription>Секции идут в том порядке, в котором заданы в курсе.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {course.theory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-brand-soft p-4 text-sm text-ink-soft">
                В этом курсе пока нет теоретических блоков.
              </div>
            ) : (
              course.theory.map((item) => (
                <Card key={item.id} className="border-brand-soft bg-soft-panel">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-ink-strong">
                        {item.order}. {item.title}
                      </h3>
                      <Badge variant="outline">#{item.order}</Badge>
                    </div>
                    <div className="max-h-48 overflow-auto rounded-xl bg-white/70 p-3 text-sm text-ink-soft whitespace-pre-wrap">
                      {item.contentMd}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5" />
                Мета
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Slug</p>
                <p className="mt-2 font-medium text-ink-strong">{course.slug}</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Создан</p>
                <p className="mt-2 font-medium text-ink-strong">{formatDate(course.createdAt)}</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Обновлен</p>
                <p className="mt-2 font-medium text-ink-strong">{formatDate(course.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers3 className="h-5 w-5" />
                Практические задания
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.practiceTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-brand-soft p-4 text-sm text-ink-soft">
                  Практические задания еще не добавлены.
                </div>
              ) : (
                course.practiceTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-brand-soft bg-soft-panel p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink-strong">
                          {task.order}. {task.title}
                        </p>
                        <p className="mt-1 text-sm text-ink-soft whitespace-pre-wrap">
                          {task.statementMd}
                        </p>
                      </div>
                      <Badge>{task.maxScore} баллов</Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {task.timeLimitMs ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {task.timeLimitMs} ms
                        </span>
                      ) : null}
                      {task.memoryLimitMb ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                          <Trophy className="h-3.5 w-3.5" />
                          {task.memoryLimitMb} MB
                        </span>
                      ) : null}
                      {task.externalRef ? (
                        <Link
                          href={task.externalRef}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-brand-strong"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Внешняя ссылка
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
