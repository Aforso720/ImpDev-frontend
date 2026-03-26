"use client"

import Link from "next/link"
import { startTransition, useDeferredValue, useState, type ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { BookOpen, ChevronLeft, ChevronRight, Filter, GraduationCap, Layers3, Search, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/format-date"

import { CourseService } from "../course.service"
import type { CourseListItem, CourseScopeFilter } from "../course.types"
import type { HeroSlide } from "@/features/ui/HeroSlider"
import { HeroSlider } from "@/features/ui/HeroSlider"

const PAGE_SIZE = 6

const scopeMeta: Record<CourseScopeFilter, { label: string; icon: ReactNode }> = {
  ALL: { label: "Все", icon: <Layers3 className="h-4 w-4" /> },
  PUBLIC: { label: "Публичные", icon: <BookOpen className="h-4 w-4" /> },
  UNIVERSITY: { label: "Университет", icon: <GraduationCap className="h-4 w-4" /> },
  TEAM: { label: "Команда", icon: <Users className="h-4 w-4" /> },
}

function scopeBadge(scope: CourseListItem["scope"]) {
  switch (scope) {
    case "PUBLIC":
      return <Badge variant="secondary">Публичный</Badge>
    case "UNIVERSITY":
      return <Badge variant="outline">Университетский</Badge>
    case "TEAM":
      return <Badge>Командный</Badge>
  }
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

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const catalogSlides: HeroSlide[] = [
    {
      id: "catalog-overview",
      kicker: "Каталог обучения",
      title: "Курсы для команды, университета и общего доступа",
      description: "Быстрый обзор каталога с актуальными метриками по фильтрам и страницам.",
      href: "/courses/my",
      hrefLabel: "Мои курсы",
      secondaryHref: "/team",
      secondaryLabel: "Команда",
      tone: "indigo",
      stats: [
        { label: "Найдено", value: `${total}` },
        { label: "Страница", value: `${page}/${totalPages}` },
        { label: "Фильтр", value: scopeMeta[scope].label },
      ],
    },
    {
      id: "catalog-filtering",
      kicker: "Поиск и фильтрация",
      title: "Настройте выборку курсов под нужный контекст",
      description:
        "Поиск работает по названию и описанию, фильтры разделяют публичные, университетские и командные курсы.",
      href: "/courses",
      hrefLabel: "Сбросить фильтры",
      secondaryHref: "/university",
      secondaryLabel: "Университеты",
      tone: "ocean",
      stats: [
        { label: "Запрос", value: deferredQuery.trim() ? "Есть" : "Нет" },
        { label: "Scope", value: scope },
      ],
    },
    {
      id: "catalog-actions",
      kicker: "Навигация",
      title: "Открывайте карточки и продолжайте обучение",
      description: "Из каталога можно сразу перейти в курс, а затем закрепить материал в рабочем треке.",
      href: "/courses",
      hrefLabel: "Перейти в каталог",
      secondaryHref: "/",
      secondaryLabel: "На главную",
      tone: "teal",
      stats: [
        { label: "Карточек на странице", value: `${items.length}` },
        { label: "Всего страниц", value: `${totalPages}` },
      ],
    },
  ]

  return (
    <section className="space-y-6">
      <HeroSlider slides={catalogSlides} />

      <Card className="bg-soft-panel">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-ink-strong">
                <Filter className="h-5 w-5" />
                Фильтры каталога
              </CardTitle>
              <CardDescription className="text-ink-muted">
                Поиск и фильтрация работают поверх реальных ответов `/course`.
              </CardDescription>
            </div>

            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  startTransition(() => setPage(1))
                }}
                className="bg-white pl-9"
                placeholder="Поиск по названию или описанию..."
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

        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="space-y-4 p-5">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-16 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-sm text-destructive">
                Не удалось загрузить каталог курсов. Проверь API и повтори попытку.
              </CardContent>
            </Card>
          ) : items.length === 0 ? (
            <Empty className="border-brand-soft bg-white/60">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen />
                </EmptyMedia>
                <EmptyTitle>Курсы не найдены</EmptyTitle>
                <EmptyDescription>
                  Попробуй изменить поисковую фразу или снять фильтр по области доступа.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-3 text-sm text-ink-muted">
                <p>{isFetching ? "Обновляем список..." : `Показано ${items.length} из ${total} курсов`}</p>
                <p>Запрос: {deferredQuery.trim() ? `"${deferredQuery.trim()}"` : "без поиска"}</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {items.map((course) => (
                  <Card key={course.id} className="flex h-full flex-col border-brand-soft bg-white/85">
                    <CardContent className="flex h-full flex-col gap-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-ink-strong">{course.title}</h3>
                          <div className="flex flex-wrap gap-2">
                            {scopeBadge(course.scope)}
                            <Badge variant="outline">{course.slug}</Badge>
                          </div>
                        </div>
                      </div>

                      <p className="line-clamp-4 text-sm text-ink-soft">{course.description}</p>

                      <div className="mt-auto space-y-3">
                        <div className="rounded-xl bg-muted/60 p-3 text-sm">
                          <p className="font-medium text-ink-strong">{course.author.name}</p>
                          <p className="text-muted-foreground">Добавлен {formatDate(course.createdAt)}</p>
                        </div>

                        <Button asChild className="w-full">
                          <Link href={`/courses/${course.slug}`}>Открыть курс</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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

                <div className="text-sm text-ink-muted">
                  Страница <span className="font-semibold text-ink-strong">{page}</span> из{" "}
                  <span className="font-semibold text-ink-strong">{totalPages}</span>
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
