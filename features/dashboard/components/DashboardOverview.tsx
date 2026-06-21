"use client"

import Link from "next/link"
import { useMemo, type ReactNode } from "react"
import { useQueries, useQuery } from "@tanstack/react-query"
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Target,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CommunityService } from "@/features/community/community.service"
import { AdaptiveService } from "@/features/course/adaptive.service"
import { calculateCourseProgress, getLearningHref } from "@/features/course/course-progress.helpers"
import type { CourseProgressSummary } from "@/features/course/course-progress.helpers"
import { CourseService } from "@/features/course/course.service"
import type { CourseListItem, PaginatedCourses } from "@/features/course/course.types"
import { TeamService } from "@/features/team/team.service"
import { UniversityService } from "@/features/university/university.service"
import { getAccessToken } from "@/lib/services/auth-token.service"
import { userService } from "@/lib/services/user.service"

import { NuriMascot } from "./NuriMascot"

type CourseEntry = {
  course: CourseListItem
  progress?: CourseProgressSummary | null
}

const emptyCourses: PaginatedCourses = { items: [], total: 0, page: 1, limit: 6 }

const courseScopes = [
  {
    key: "PUBLIC",
    title: "PUBLIC",
    label: "Открытые курсы",
    text: "Быстрый старт без привязки к команде или вузу.",
    icon: BookOpen,
  },
  {
    key: "UNIVERSITY",
    title: "UNIVERSITY",
    label: "Университетские",
    text: "Материалы, программы и активности внутри университета.",
    icon: GraduationCap,
  },
  {
    key: "TEAM",
    title: "TEAM",
    label: "Командные",
    text: "Практика, проекты и обучение внутри рабочей команды.",
    icon: Users,
  },
] as const

function trimText(value: string | null | undefined, max = 120) {
  if (!value) return "Описание появится после заполнения карточки."
  if (value.length <= max) return value
  return `${value.slice(0, max).trim()}…`
}

function safeDate(value: string | null | undefined) {
  if (!value) return "Сегодня"

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(new Date(value))
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description?: string
}) {
  return (
    <div className="space-y-2">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-action">{eyebrow}</p> : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        {description ? <p className="max-w-xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  )
}

function HomeCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Card className={`border-border bg-card/85 text-card-foreground shadow-sm backdrop-blur dark:bg-card/80 ${className}`}>
      {children}
    </Card>
  )
}

function HeroMiniCard({
  label,
  title,
  meta,
  icon: Icon,
}: {
  label: string
  title: string
  meta: string
  icon: typeof Target
}) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.08] p-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 text-xs text-slate-200">
        <Icon className="h-4 w-4 text-nuri-accent" />
        {label}
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium text-white">{title}</p>
      <p className="mt-1 text-xs text-slate-300">{meta}</p>
    </div>
  )
}

function CoursePreviewCard({ entry, isContinue }: { entry: CourseEntry; isContinue: boolean }) {
  const progress = entry.progress
  const started = Boolean(progress && progress.totalBlocks > 0)
  const href = isContinue ? getLearningHref(entry.course.slug, progress?.currentItem) : `/courses/${entry.course.slug}`

  return (
    <HomeCard>
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{entry.course.scope}</Badge>
          {started ? <Badge className="bg-success text-white hover:bg-success">{progress?.percent ?? 0}%</Badge> : null}
        </div>
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{entry.course.title}</h3>
          <p className="line-clamp-3 text-sm text-muted-foreground">{trimText(entry.course.description)}</p>
        </div>
        <div className="mt-auto space-y-3">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-success" style={{ width: `${progress?.percent ?? 0}%` }} />
          </div>
          <Button asChild className="w-full">
            <Link href={href}>{isContinue ? "Продолжить" : "Открыть курс"}</Link>
          </Button>
        </div>
      </CardContent>
    </HomeCard>
  )
}

function EmptyCompactCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/70 p-5 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1">{text}</p>
    </div>
  )
}

export function DashboardOverview() {
  const accessToken = useMemo(() => getAccessToken(), [])
  const isAuthenticated = Boolean(accessToken)

  const userQuery = useQuery({
    queryKey: ["user", "me", "home"],
    queryFn: () => userService.getProfile(),
    enabled: isAuthenticated,
    retry: false,
  })

  const coursesQuery = useQuery({
    queryKey: ["courses", "home", "showcase"],
    queryFn: async () => {
      try {
        return await CourseService.getAvailable({ page: 1, limit: 6 })
      } catch {
        return emptyCourses
      }
    },
  })

  const universitiesQuery = useQuery({
    queryKey: ["universities", "home", "showcase"],
    queryFn: async () => {
      try {
        return await UniversityService.getAll()
      } catch {
        return []
      }
    },
  })

  const teamsQuery = useQuery({
    queryKey: ["teams", "home", "showcase"],
    queryFn: async () => {
      try {
        return await TeamService.getAllTeams()
      } catch {
        return []
      }
    },
  })

  const postsQuery = useQuery({
    queryKey: ["community", "posts", "home"],
    queryFn: () => CommunityService.getPosts({ page: 1, limit: 3 }),
  })

  const eventsQuery = useQuery({
    queryKey: ["community", "events", "home"],
    queryFn: () => CommunityService.getEvents({ page: 1, limit: 2, upcomingOnly: true }),
  })

  const ordersQuery = useQuery({
    queryKey: ["community", "orders", "home"],
    queryFn: () => CommunityService.getOrders({ page: 1, limit: 2, status: "OPEN" }),
  })

  const courses = useMemo(() => coursesQuery.data?.items ?? [], [coursesQuery.data?.items])
  const courseIds = useMemo(() => courses.map((course) => course.id), [courses])

  const adaptiveStatesQuery = useQuery({
    queryKey: ["adaptive", "course-states", "home", courseIds],
    queryFn: async () => {
      try {
        return await AdaptiveService.getCourseStates(courseIds)
      } catch {
        return []
      }
    },
    enabled: isAuthenticated && courseIds.length > 0,
  })

  const adaptiveStateMap = useMemo(
    () => new Map((adaptiveStatesQuery.data ?? []).map((state) => [state.courseId, state])),
    [adaptiveStatesQuery.data],
  )

  const planTargets = useMemo(
    () =>
      courses.flatMap((course) => {
        const adaptiveEnrollmentId = adaptiveStateMap.get(course.id)?.adaptiveEnrollmentId
        if (!adaptiveEnrollmentId) return []
        return [{ courseId: course.id, adaptiveEnrollmentId }]
      }),
    [adaptiveStateMap, courses],
  )

  const planQueries = useQueries({
    queries: planTargets.map((target) => ({
      queryKey: ["adaptive", "plans", "home", target.adaptiveEnrollmentId],
      queryFn: async () => {
        try {
          return await AdaptiveService.getPlans(target.adaptiveEnrollmentId, { currentOnly: true })
        } catch {
          return []
        }
      },
      enabled: isAuthenticated,
      staleTime: 60_000,
    })),
  })

  const progressByCourse = useMemo(() => {
    const map = new Map<string, CourseProgressSummary>()

    planTargets.forEach((target, index) => {
      map.set(target.courseId, calculateCourseProgress(planQueries[index]?.data?.[0]))
    })

    return map
  }, [planQueries, planTargets])

  const courseEntries = useMemo<CourseEntry[]>(
    () =>
      courses.map((course) => ({
        course,
        progress: progressByCourse.get(course.id),
      })),
    [courses, progressByCourse],
  )

  const continueEntries = useMemo(
    () =>
      courseEntries
        .filter((entry) => entry.progress && entry.progress.totalBlocks > 0 && entry.progress.remainingBlocks > 0)
        .sort((left, right) => (right.progress?.percent ?? 0) - (left.progress?.percent ?? 0))
        .slice(0, 3),
    [courseEntries],
  )

  const popularEntries = courseEntries.slice(0, 3)
  const showContinue = isAuthenticated && continueEntries.length > 0
  const primaryEntries = showContinue ? continueEntries : popularEntries
  const topEntry = primaryEntries[0]
  const nextItem = topEntry?.progress?.currentItem
  const universities = universitiesQuery.data ?? []
  const teams = teamsQuery.data ?? []
  const posts = postsQuery.data?.items ?? []
  const events = eventsQuery.data?.items ?? []
  const orders = ordersQuery.data?.items ?? []

  const scopeCounts = courseScopes.map((scope) => ({
    ...scope,
    count: courses.filter((course) => course.scope === scope.key).length,
  }))

  const userName = userQuery.data?.name
  const heroProgress = topEntry?.progress?.percent ?? 0
  const primaryHref = showContinue && topEntry ? getLearningHref(topEntry.course.slug, nextItem) : "/courses"
  const secondaryHref = isAuthenticated ? "/courses/studying" : "/auth"

  return (
    <section className="mx-auto w-full max-w-[1240px] space-y-6 pb-10">
      <div className="overflow-hidden rounded-[2rem] bg-brand-deep text-white shadow-2xl shadow-brand-deep/20">
        <div className="grid gap-8 bg-gradient-to-br from-brand-deep via-brand-panel to-brand-deep p-5 sm:p-7 lg:grid-cols-[1.05fr_0.95fr] lg:p-9">
          <div className="flex min-h-[420px] flex-col justify-center space-y-6">
            <Badge className="w-fit border border-white/12 bg-white/10 text-white hover:bg-white/10">
              {userName ? `${userName}, Nuri рядом` : "Bayanum LMS · Nuri рядом"}
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Учиться, делать проекты и не терять следующий шаг
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
                Bayanum собирает курсы, команды, университеты и сообщество в спокойный рабочий маршрут. Nuri подсвечивает прогресс, ближайшие задачи и места, где нужна ваша энергия.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild firefly>
                <Link href={primaryHref}>{showContinue ? "Продолжить обучение" : "Открыть каталог"}</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/[0.22] bg-white/[0.08] text-white hover:bg-white/[0.14] hover:text-white">
                <Link href={secondaryHref}>{isAuthenticated ? "Мое обучение" : "Войти в аккаунт"}</Link>
              </Button>
            </div>
          </div>

          <div className="relative grid content-center gap-4">
            <div className="absolute inset-x-8 top-8 h-32 rounded-full bg-nuri-accent/10 blur-3xl" />
            <NuriMascot />
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <HeroMiniCard
                icon={Target}
                label="Прогресс курса"
                title={topEntry?.course.title ?? "Выберите курс в каталоге"}
                meta={`${heroProgress}% завершено`}
              />
              <HeroMiniCard
                icon={CalendarClock}
                label="Ближайший шаг"
                title={nextItem?.title ?? events[0]?.title ?? "План появится после старта курса"}
                meta={nextItem?.expectedMinutes ? `${nextItem.expectedMinutes} мин` : safeDate(events[0]?.startAt)}
              />
              <HeroMiniCard
                icon={GraduationCap}
                label="Команда / университет"
                title={teams[0]?.name ?? universities[0]?.name ?? "Присоединитесь к среде обучения"}
                meta={`${teams.length} команд · ${universities.length} вузов`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          <SectionHeader
            eyebrow={showContinue ? "Ваш маршрут" : "Для старта"}
            title={showContinue ? "Продолжить обучение" : "Популярные курсы"}
            // description={
            //   showContinue
            //     ? "Короткий список курсов, где уже есть активный adaptive-план."
            //     : "Несколько курсов из каталога, чтобы быстро понять формат платформы."
            // }
          />
          {coursesQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-64 rounded-3xl" />
              ))}
            </div>
          ) : primaryEntries.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {primaryEntries.map((entry) => (
                <CoursePreviewCard key={entry.course.id} entry={entry} isContinue={showContinue} />
              ))}
            </div>
          ) : (
            <EmptyCompactCard title="Курсы пока не загрузились" text="Каталог останется доступен по маршруту /courses, когда backend вернет опубликованные курсы." />
          )}
        </div>

        <HomeCard>
          <CardContent className="space-y-4 p-5">
            <SectionHeader eyebrow="Сегодня" title="Что сегодня важно" />
            <div className="space-y-3">
              <ImportantItem
                icon={Target}
                title={nextItem?.title ?? orders[0]?.title ?? "Выберите следующий учебный шаг"}
                text={nextItem ? "Активный блок в вашем маршруте." : orders[0]?.summary ?? "Nuri покажет задачу после старта курса."}
                accent="blue"
              />
              <ImportantItem
                icon={CalendarClock}
                title={events[0]?.title ?? "Ближайших дедлайнов нет"}
                text={events[0] ? `${safeDate(events[0].startAt)} · ${events[0].location}` : "Можно спокойно продолжить курс или открыть каталог."}
                accent="yellow"
              />
              <ImportantItem
                icon={CheckCircle2}
                title={posts[0]?.title ?? "Активности сообщества появятся здесь"}
                text={posts[0] ? `${posts[0]._count.comments} комментариев · ${posts[0]._count.reactions} реакций` : "Лента доступна в разделе сообщества."}
                accent="green"
              />
            </div>
          </CardContent>
        </HomeCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <HomeCard>
          <CardContent className="space-y-5 p-5">
            <SectionHeader eyebrow="Каталог" title="Курсы по доступу" description="Три понятные зоны без лишней навигации." />
            <div className="grid gap-3">
              {scopeCounts.map((scope) => {
                const ScopeIcon = scope.icon

                return (
                  <Link
                    key={scope.key}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/70 p-4 transition hover:-translate-y-0.5 hover:bg-accent/50 dark:bg-card/70 dark:hover:bg-accent/25"
                    href="/courses"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl bg-brand-deep p-2 text-white dark:bg-nuri-accent dark:text-brand-deep">
                        <ScopeIcon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-foreground">{scope.label}</span>
                        <span className="block text-xs text-muted-foreground">{scope.text}</span>
                      </span>
                    </div>
                    <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-foreground dark:bg-muted">
                      {scope.count}
                    </span>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </HomeCard>

        <HomeCard>
          <CardContent className="space-y-5 p-5">
            <SectionHeader
              eyebrow="Среда"
              title="Команды и университеты"
              description="Не отдельные витрины, а место, где обучение связано с людьми и проектами."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <CommunityList
                icon={Users}
                title="Команды"
                href="/team"
                items={teams.slice(0, 3).map((team) => ({
                  title: team.name,
                  text: team.description ?? `${team._count?.users ?? 0} участников`,
                }))}
                empty="Команды появятся после создания или приглашения."
              />
              <CommunityList
                icon={GraduationCap}
                title="Университеты"
                href="/university"
                items={universities.slice(0, 3).map((university) => ({
                  title: university.name,
                  text: university.city ?? university.region ?? `${university._count.memberships} участников`,
                }))}
                empty="Университетские профили пока не загружены."
              />
            </div>
          </CardContent>
        </HomeCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
        <HomeCard className="overflow-hidden">
          <CardContent className="relative space-y-5 p-5">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-nuri-accent/20 blur-3xl" />
            <SectionHeader eyebrow="Nuri" title="Nuri-помощник" />
            <div className="rounded-3xl border border-nuri-accent/30 bg-accent/70 p-4 dark:bg-accent/20">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-nuri-accent text-brand-deep">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Рекомендация на сейчас</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {topEntry
                      ? `Начните с «${nextItem?.title ?? topEntry.course.title}». Это самый короткий путь вернуться в учебный ритм.`
                      : "Откройте каталог и выберите первый курс — я подсвечу прогресс и ближайший шаг."}
                  </p>
                </div>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href={primaryHref}>Перейти к рекомендации</Link>
            </Button>
          </CardContent>
        </HomeCard>

        <HomeCard>
          <CardContent className="space-y-5 p-5">
            <SectionHeader eyebrow="Сообщество" title="Активность сообщества" description="Новости, обсуждения и сигналы от людей рядом." />
            <div className="grid gap-3">
              {postsQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-2xl" />)
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <Link
                    key={post.id}
                    className="rounded-2xl border border-border bg-background/60 p-4 transition hover:bg-accent/40 dark:bg-card/70 dark:hover:bg-accent/25"
                    href="/community"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="line-clamp-1 text-sm font-semibold text-foreground">{post.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{trimText(post.contentMd, 130)}</p>
                      </div>
                      <Badge variant="outline" className="w-fit shrink-0">
                        {post.categories[0]?.title ?? "Лента"}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {post.author.name} · {post._count.comments} комментариев · {post._count.reactions} реакций
                    </p>
                  </Link>
                ))
              ) : (
                <EmptyCompactCard title="Лента пока спокойная" text="Когда появятся новости, обсуждения или объявления, Nuri покажет их здесь." />
              )}
            </div>
          </CardContent>
        </HomeCard>
      </div>
    </section>
  )
}

function ImportantItem({
  icon: Icon,
  title,
  text,
  accent,
}: {
  icon: typeof Target
  title: string
  text: string
  accent: "blue" | "green" | "yellow"
}) {
  const accentClass = {
    blue: "bg-action/12 text-action",
    green: "bg-success/12 text-success",
    yellow: "bg-nuri-accent/20 text-brand-deep dark:text-nuri-soft",
  }[accent]

  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-background/65 p-4 dark:bg-card/70">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accentClass}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="line-clamp-1 text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

function CommunityList({
  icon: Icon,
  title,
  href,
  items,
  empty,
}: {
  icon: typeof Users
  title: string
  href: string
  items: Array<{ title: string; text: string }>
  empty: string
}) {
  return (
    <div className="rounded-3xl border border-border bg-background/65 p-4 dark:bg-card/70">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-brand-deep p-2 text-white dark:bg-nuri-accent dark:text-brand-deep">
            <Icon className="h-4 w-4" />
          </span>
          <p className="font-semibold text-foreground">{title}</p>
        </div>
        <Button asChild size="icon-sm" variant="ghost">
          <Link aria-label={`Открыть ${title}`} href={href}>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.title} className="rounded-2xl bg-card/70 p-3 dark:bg-muted/50">
              <p className="line-clamp-1 text-sm font-medium text-foreground">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.text}</p>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-3 text-xs text-muted-foreground">
            {empty}
          </p>
        )}
      </div>
    </div>
  )
}
