"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Compass,
  GraduationCap,
  Newspaper,
  PenSquare,
  Sparkles,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { CommunityHighlights } from "@/features/community/components/CommunityHighlights"
import { CourseService } from "@/features/course/course.service"
import type { CourseScope } from "@/features/course/course.types"
import { TeamService } from "@/features/team/team.service"
import type { HeroSlide } from "@/features/ui/HeroSlider"
import { HeroSlider } from "@/features/ui/HeroSlider"
import { UniversityService } from "@/features/university/university.service"
import type { UniversityItem } from "@/features/university/university.types"
import type { ITeam } from "@/lib/types"
import { userService } from "@/lib/services/user.service"

const courseMeta: Record<CourseScope, { direction: string; level: string; format: string }> = {
  PUBLIC: {
    direction: "Открытый трек",
    level: "Базовый",
    format: "Онлайн",
  },
  UNIVERSITY: {
    direction: "Вузовская траектория",
    level: "Продвинутый",
    format: "Семинар + практика",
  },
  TEAM: {
    direction: "Командная практика",
    level: "Прикладной",
    format: "Проектный",
  },
}

const quickRoutes = [
  { title: "Университеты", href: "/university", icon: GraduationCap },
  { title: "Курсы", href: "/courses", icon: BookOpen },
  { title: "Сообщества", href: "/team", icon: Users },
  { title: "Профиль", href: "/profile", icon: Compass },
]

function trimText(value: string | null | undefined, max = 120) {
  if (!value) return "Описание появится после заполнения карточки."
  if (value.length <= max) return value
  return `${value.slice(0, max).trim()}...`
}

function resolveUniversityForTeam(team: ITeam) {
  const linked = team as ITeam & {
    universityName?: string | null
    university?: { name?: string | null } | null
  }

  return linked.university?.name ?? linked.universityName ?? "Связь с университетом уточняется"
}

function universityTags(item: UniversityItem) {
  return item.tags.slice(0, 3).map((tag) => tag.value)
}

export function DashboardOverview() {
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => userService.getProfile(),
  })

  const { data: universities = [], isLoading: isUniversitiesLoading } = useQuery({
    queryKey: ["universities", "showcase"],
    queryFn: () => UniversityService.getAll(),
  })

  const { data: courses, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["courses", "dashboard", "showcase"],
    queryFn: () => CourseService.getAvailable({ page: 1, limit: 6 }),
  })

  const { data: teams = [], isLoading: isTeamsLoading } = useQuery({
    queryKey: ["team", "dashboard", "showcase"],
    queryFn: () => TeamService.getAllTeams(),
  })

  const featuredUniversities = universities.slice(0, 6)
  const featuredCourses = (courses?.items ?? []).slice(0, 6)
  const featuredCommunities = teams.slice(0, 4)
  const estimatedUsers = universities.reduce((sum, item) => sum + (item._count?.memberships ?? 0), 0)

  const heroSlides: HeroSlide[] = [
    {
      id: "bayanum-core",
      kicker: "Платформа Bayanum",
      title: "Цифровая экосистема науки и образования региона",
      description:
        "Bayanum объединяет университеты, преподавателей, студентов, курсы и сообщества в единую среду развития компетенций.",
      href: "/courses",
      hrefLabel: "Начать с курсов",
      secondaryHref: "/university",
      secondaryLabel: "Открыть университеты",
      tone: "ocean",
      stats: [
        { label: "Университеты", value: `${universities.length}` }, 
        { label: "Сообщества", value: `${teams.length}` },
      ],
    },
    {
      id: "bayanum-routes",
      kicker: "Умная витрина",
      title: isUserLoading ? "Загрузка персонального контекста..." : `С возвращением, ${user?.name || user?.email}`,
      description:
        "Главная страница показывает только ключевой обзор и сразу переводит вас в профильные разделы платформы без дублирования контента.",
      href: "/team",
      hrefLabel: "Перейти в сообщества",
      secondaryHref: "/profile",
      secondaryLabel: "Открыть профиль",
      tone: "indigo",
      stats: [
        { label: "Пользователи (оценка)", value: estimatedUsers > 0 ? `${estimatedUsers}` : "—" },
        { label: "Мой статус", value: user?.role ?? "Пользователь" },
      ],
    },
  ]

  return (
    <section className="mx-auto w-full max-w-[1240px] space-y-8 pb-8">
      <HeroSlider slides={heroSlides} autoPlayMs={7000} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickRoutes.map((route) => (
          <Card key={route.title} className="border-brand-soft bg-soft-panel">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-brand-panel p-2.5">
                  <route.icon className="h-4 w-4 text-ink-inverse" />
                </div>
                <p className="font-medium text-ink-strong">{route.title}</p>
              </div>
              <Button asChild size="icon" variant="ghost" className="text-brand-strong hover:text-brand-strong">
                <Link href={route.href}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-brand-soft bg-soft-panel">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Университеты региона
            </CardTitle>
            <CardDescription>
              Короткий обзор активных вузов. Полный профиль, программы и факты остаются в отдельном разделе.
            </CardDescription>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/university">Все университеты</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isUniversitiesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : featuredUniversities.length === 0 ? (
            <Empty className="bg-white/60">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Building2 />
                </EmptyMedia>
                <EmptyTitle>Пока нет подключенных университетов</EmptyTitle>
                <EmptyDescription>
                  Когда карточки вузов появятся, здесь будет компактная витрина и быстрые маршруты перехода.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featuredUniversities.map((university) => (
                <Card key={university.id} className="overflow-hidden border-brand-soft bg-white/85">
                  <div
                    className="h-24 w-full bg-gradient-to-br from-[#1D2D44] via-[#344966] to-[#57759a]"
                    style={
                      university.bannerUrl
                        ? {
                            backgroundImage: `linear-gradient(rgba(29,45,68,0.45), rgba(52,73,102,0.4)), url(${university.bannerUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  />
                  <CardContent className="space-y-4 p-4">
                    <div className="space-y-2">
                      <h3 className="line-clamp-2 text-lg font-semibold text-ink-strong">{university.name}</h3>
                      <p className="text-sm text-ink-muted">{university.city || "Город уточняется"}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {universityTags(university).length > 0 ? (
                        universityTags(university).map((tag) => (
                          <Badge key={`${university.id}-${tag}`} variant="outline">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline">Профиль формируется</Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <p className="text-ink-soft">{university._count.memberships} участников</p>
                      <Link href={`/university/${university.slug}`} className="font-medium text-brand-strong">
                        Открыть
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Актуальные курсы
            </CardTitle>
            <CardDescription>
              На главной только обзор: ключевые параметры и быстрый переход. Подробная программа остаётся в карточке
              курса.
            </CardDescription>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/courses">Каталог курсов</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isCoursesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : featuredCourses.length === 0 ? (
            <Empty className="bg-muted/30">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen />
                </EmptyMedia>
                <EmptyTitle>Пока нет опубликованных курсов</EmptyTitle>
                <EmptyDescription>Когда курсы появятся, здесь будет короткая витрина популярных траекторий.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featuredCourses.map((course) => (
                <Card key={course.id} className="border-brand-soft bg-soft-panel">
                  <CardContent className="space-y-4 p-5">
                    <div className="space-y-2">
                      <h3 className="line-clamp-2 text-lg font-semibold text-ink-strong">{course.title}</h3>
                      <p className="line-clamp-3 text-sm text-ink-soft">{trimText(course.description, 130)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{courseMeta[course.scope].direction}</Badge>
                      <Badge variant="outline">{courseMeta[course.scope].level}</Badge>
                      <Badge variant="secondary">{courseMeta[course.scope].format}</Badge>
                    </div>

                    <div className="rounded-xl bg-white/70 p-3 text-sm">
                      <p className="font-medium text-ink-strong">{course.author.name}</p>
                      <p className="text-ink-muted">Автор курса</p>
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/courses/${course.slug}`}>Перейти к курсу</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-brand-soft bg-soft-panel">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Сообщества и группы
            </CardTitle>
            <CardDescription>
              Витрина активных команд: краткий контекст и переход в раздел со составом, ролями и активностью.
            </CardDescription>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/team">Открыть сообщества</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isTeamsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : featuredCommunities.length === 0 ? (
            <Empty className="bg-white/65">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle>Пока нет команд в витрине</EmptyTitle>
                <EmptyDescription>
                  После появления активных сообществ здесь будут отображаться карточки с краткой информацией.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {featuredCommunities.map((team) => (
                <Card key={team.id} className="border-brand-soft bg-white/85">
                  <CardContent className="space-y-3 p-4">
                    <h3 className="line-clamp-2 text-base font-semibold text-ink-strong">{team.name}</h3>
                    <p className="line-clamp-3 text-sm text-ink-soft">{trimText(team.description, 92)}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">
                      {resolveUniversityForTeam(team)}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-soft">{team._count?.users ?? 0} участников</span>
                      <Link href="/team" className="font-medium text-brand-strong">
                        Перейти
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5" />
              Платформа для преподавателей
            </CardTitle>
            <CardDescription>
              Bayanum поддерживает не только обучение студентов, но и методическую и проектную работу преподавателей.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <Card className="border-brand-soft bg-soft-panel">
              <CardContent className="space-y-2 p-4">
                <PenSquare className="h-5 w-5 text-brand-strong" />
                <p className="font-medium text-ink-strong">Создание курсов</p>
                <p className="text-sm text-ink-soft">Формируйте собственные треки и обновляйте материалы без лишней рутины.</p>
              </CardContent>
            </Card>
            <Card className="border-brand-soft bg-soft-panel">
              <CardContent className="space-y-2 p-4">
                <Sparkles className="h-5 w-5 text-brand-strong" />
                <p className="font-medium text-ink-strong">Проверка практики</p>
                <p className="text-sm text-ink-soft">Оценивайте практические работы и давайте точечную обратную связь.</p>
              </CardContent>
            </Card>
            <Card className="border-brand-soft bg-soft-panel">
              <CardContent className="space-y-2 p-4">
                <Users className="h-5 w-5 text-brand-strong" />
                <p className="font-medium text-ink-strong">Обмен практиками</p>
                <p className="text-sm text-ink-soft">Синхронизируйте подходы между вузами и усиливайте совместные программы.</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card className="border-brand-soft bg-soft-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5" />
              Развитие компетенций
            </CardTitle>
            <CardDescription>
              Платформа строит путь от теории к измеримому результату, а не просто хранит учебные материалы.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "1. Курс", body: "Структурированная теория и базовые кейсы." },
              { title: "2. Практика", body: "Задания, проекты и прикладные сценарии." },
              { title: "3. Проверка", body: "Оценка преподавателем и корректировка траектории." },
              { title: "4. Рост", body: "Накопление подтверждённых компетенций." },
            ].map((step) => (
              <div key={step.title} className="rounded-2xl border border-brand-soft bg-white/75 p-4">
                <p className="font-medium text-ink-strong">{step.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{step.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              Новости и инициативы
            </CardTitle>
            <CardDescription>
              Блок для новостей платформы и научно-образовательных инициатив. Сейчас раздел подготовлен как empty-state.
            </CardDescription>
          </div>
          <Badge variant="outline">Скоро</Badge>
        </CardHeader>
        <CardContent>
          <Empty className="bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Newspaper />
              </EmptyMedia>
              <EmptyTitle>Лента обновлений готовится</EmptyTitle>
              <EmptyDescription>
                Здесь появятся объявления о новых курсах, мероприятиях и партнёрских инициативах университетов региона.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card> */}

      <CommunityHighlights />
    </section>
  )
}
