"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { GraduationCap, ShieldCheck, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

import { UniversityService } from "../university.service"

function roleLabel(role: "LEADER" | "INSTRUCTOR" | "STUDENT") {
  switch (role) {
    case "LEADER":
      return "Лидер"
    case "INSTRUCTOR":
      return "Преподаватель"
    case "STUDENT":
      return "Студент"
  }
}

export function MyUniversities() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["universities", "my"],
    queryFn: () => UniversityService.getMy(),
  })

  const items = data ?? []

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden border-0 bg-brand-panel">
        <CardContent className="grid gap-4 p-6 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <Badge variant="secondary" className="bg-white/12 text-ink-inverse hover:bg-white/12">
              Университетские связи
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold text-ink-inverse">Мои университеты</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-inverse/80">
              Страница работает на `/university/my` и показывает активные membership-связи текущего пользователя.
            </p>
          </div>

          <Card className="bg-white/10 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-inverse/60">Активных связей</p>
              <p className="mt-2 text-3xl font-semibold text-ink-inverse">{items.length}</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-56 rounded-3xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-sm text-destructive">
            Не удалось загрузить университеты пользователя.
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Empty className="border-brand-soft bg-white/70">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GraduationCap />
            </EmptyMedia>
            <EmptyTitle>Университет пока не привязан</EmptyTitle>
            <EmptyDescription>
              Добавь инвайт или назначение через админку, чтобы пользователь видел свои университетские роли.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="border-brand-soft bg-white/85">
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge>{roleLabel(item.myRole)}</Badge>
                  <Badge variant="outline">{item.myStatus}</Badge>
                </div>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.slug}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-ink-soft">{item.description || "Описание пока не заполнено."}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {item.city ? <span className="rounded-full bg-muted px-2 py-1">{item.city}</span> : null}
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                    <Users className="h-3.5 w-3.5" />
                    {item._count.memberships}
                  </span>
                  {item.isState ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Государственный
                    </span>
                  ) : null}
                </div>
                <Link href={`/university/${item.slug}`} className="text-sm font-medium text-brand-strong">
                  Открыть профиль университета
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
