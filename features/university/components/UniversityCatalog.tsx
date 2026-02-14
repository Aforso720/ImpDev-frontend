"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

import { Card, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { MAIN_COLOR } from "@/lib/constants/colors.constants"
import { formatDate } from "@/lib/format-date"

import { UniversityService } from "../university.service"
import type { UniversityItem } from "../university.types"
import { InviteLinkDialog } from "./InviteLinkDialog"
import { getInitials } from "@/lib/getInitials"

export function UniversityCatalog() {
  const [q, setQ] = useState("")

  const { data, isLoading, isError } = useQuery({
    queryKey: ["universities", "all"],
    queryFn: () => UniversityService.getAll(),
  })

  const items = (data ?? []) as UniversityItem[]

  return (
    <Card className={`bg-[${MAIN_COLOR}] mt-10 p-5 mb-5`}>
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-2xl flex-1">Университеты</CardTitle>

        <div className="w-full md:w-[360px]">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по названию или описанию…"
            className="border-[#344966]"
          />
        </div>
      </header>

      <Separator className="my-4" />

      <section className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[40%]" />
                <Skeleton className="h-3 w-[65%]" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[30%]" />
                <Skeleton className="h-3 w-[55%]" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          </>
        ) : isError ? (
          <div className="text-sm text-destructive">Не удалось загрузить список университетов</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">Ничего не найдено</div>
        ) : (
          items.map((u) => {
            const members = u._count?.memberships ?? 0
            const invite = u.inviteUrl?.trim() || null

            return (
              <Card key={u.id} className="p-4 bg-muted/30">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={u.avatarUrl ?? undefined} alt={u.name} />
                      <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="font-semibold truncate">{u.name}</p>
                        <Badge variant="secondary" className="shrink-0">
                          Участников: {members}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {u.description || "Без описания"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Slug: {u.slug}</span>
                        <span>Создан: {u.createdAt ? formatDate(u.createdAt) : "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {invite ? (
                      <InviteLinkDialog
                        inviteUrl={invite}
                        trigger={<Button variant="outline" size="sm">Инвайт</Button>}
                      />
                    ) : null}

                    <Button asChild size="sm">
                      <Link href={`/university/${u.slug}`}>Открыть</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </section>
    </Card>
  )
}
