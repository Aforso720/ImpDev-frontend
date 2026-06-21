"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowUpRight, MapPin, Search, ShieldCheck, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/format-date"
import { getInitials } from "@/lib/getInitials"
import { cn } from "@/lib/utils"

import { UniversityService } from "../university.service"
import type { UniversityItem } from "../university.types"
import { InviteLinkDialog } from "./InviteLinkDialog"

function normalize(value?: string | null) {
  return (value ?? "").trim().toLowerCase()
}

export function UniversityCatalog() {
  const [q, setQ] = useState("")

  const { data, isLoading, isError } = useQuery({
    queryKey: ["universities", "all"],
    queryFn: () => UniversityService.getAll(),
  })

  const items = (data ?? []) as UniversityItem[]
  const query = normalize(q)

  const filtered = useMemo(() => {
    if (!query) return items

    return items.filter((uni) => {
      const haystack = [
        uni.name,
        uni.slug,
        uni.description,
        uni.city,
        uni.region,
        ...(uni.tags ?? []).map((tag) => tag.value),
      ]
        .map(normalize)
        .join(" ")

      return haystack.includes(query)
    })
  }, [items, query])

  const totalMembers = items.reduce((sum, uni) => sum + (uni._count?.memberships ?? 0), 0)

  return (
    <section className="mt-8 space-y-4">
      <Card className="overflow-hidden border-0 bg-brand-deep py-0">
        <CardContent className="grid gap-4 p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <Badge variant="secondary" className="bg-nuri-accent/15 text-white hover:bg-nuri-accent/15">
              Каталог университетов
            </Badge>

            <CardTitle className="mt-4 text-3xl text-white">Университеты региона</CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-white/80">
              Карточки сделаны крупнее и выразительнее, чтобы каталог выглядел полноценно даже при небольшом количестве вузов.
            </CardDescription>

            <div className="relative mt-4 w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Поиск по названию, описанию, городу..."
                className="h-10 border-nuri-accent/20 bg-card/90 pl-9"
              />
            </div>
          </div>

          <Card className="bg-card/10 py-0 shadow-none">
            <CardContent className="grid h-full gap-3 p-4">
              <div className="rounded-xl bg-nuri-accent/15 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-white/65">Вузов</p>
                <p className="mt-1 text-2xl font-semibold text-white">{items.length}</p>
              </div>

              <div className="rounded-xl bg-nuri-accent/15 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-white/65">Участников</p>
                <p className="mt-1 text-2xl font-semibold text-white">{totalMembers}</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            Не удалось загрузить список университетов.
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            {query ? "По вашему запросу ничего не найдено." : "Пока нет университетов для отображения."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((uni) => {
            const members = uni._count?.memberships ?? 0
            const invite = uni.inviteUrl?.trim() || null
            const cityLine = [uni.city, uni.region].filter(Boolean).join(" • ")
            const shouldStretch = filtered.length === 1

            return (
              <Card
                key={uni.id}
                className={cn(
                  "group overflow-hidden border-border bg-card/85 py-0 transition-shadow hover:shadow-md",
                  shouldStretch && "md:col-span-2 2xl:col-span-3"
                )}
              >
                <div className="relative h-32 overflow-hidden">
                  {uni.bannerUrl ? (
                    <>
                      <img
                        src={uni.bannerUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/60 via-brand-deep/30 to-transparent" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-deep via-brand-panel to-action" />
                  )}

                  <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-brand-deep/55 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                    {cityLine || "Региональный университет"}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar className="h-11 w-11 shrink-0 ring-2 ring-card">
                      <AvatarImage src={uni.avatarUrl ?? undefined} alt={uni.name} />
                      <AvatarFallback>{getInitials(uni.name)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <CardTitle className="truncate text-lg">{uni.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{uni.slug}</p>
                    </div>
                  </div>

                  <p className="mt-3 min-h-[3.75rem] text-sm text-muted-foreground line-clamp-3">
                    {uni.description || "Описание пока не добавлено."}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary" className="gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {members}
                    </Badge>

                    <Badge variant="outline" className="gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {uni.city || "Город не указан"}
                    </Badge>

                    <Badge variant="outline">Создан: {uni.createdAt ? formatDate(uni.createdAt) : "—"}</Badge>

                    {uni.isState ? (
                      <Badge variant="outline" className="gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Гос.
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild size="sm" className="gap-1.5">
                      <Link href={`/university/${uni.slug}`}>
                        Открыть профиль
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>

                    {invite ? (
                      <InviteLinkDialog
                        inviteUrl={invite}
                        trigger={
                          <Button variant="outline" size="sm">
                            Инвайт
                          </Button>
                        }
                      />
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}
