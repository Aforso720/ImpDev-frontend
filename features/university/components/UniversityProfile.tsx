"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  BadgeCheck,
  ExternalLink,
  GraduationCap,
  Home,
  Landmark,
  Link2,
  Mail,
  MapPin,
  Phone,
  Shield,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { MAIN_COLOR } from "@/lib/constants/colors.constants"
import { formatDate } from "@/lib/format-date"
import { UniversityService } from "../university.service"
import type { UniversityItem, UniversitySocialLink } from "../university.types"
import { InviteLinkDialog } from "./InviteLinkDialog"

function getInitials(name: string) {
  const s = (name ?? "").trim()
  if (!s) return "??"
  const parts = s.split(/\s+/)
  const a = parts[0]?.[0] ?? ""
  const b = parts[1]?.[0] ?? ""
  return (a + b).toUpperCase() || s.slice(0, 2).toUpperCase()
}

function linkTitle(l: UniversitySocialLink) {
  const t = l.title?.trim()
  if (t) return t
  switch (l.type) {
    case "WEBSITE":
      return "Официальный сайт"
    case "VK":
      return "ВКонтакте"
    case "TELEGRAM":
      return "Telegram"
    case "YOUTUBE":
      return "YouTube"
    default:
      return "Ссылка"
  }
}

function copy(text: string, okText: string) {
  if (!text?.trim()) return
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(okText))
    .catch(() => toast.error("Не удалось скопировать"))
}

function MetaChip({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-[#1d2d44]">
      <span className="opacity-80">{icon}</span>
      <span className="truncate">{children}</span>
    </div>
  )
}

function Feature({
  active,
  icon,
  label,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
}) {
  if (!active) return null
  return (
    <Badge variant="secondary" className="gap-2 bg-white/70 text-[#1d2d44]">
      {icon}
      {label}
    </Badge>
  )
}

function ContactRow({
  icon,
  label,
  value,
  href,
  onCopy,
}: {
  icon: React.ReactNode
  label: string
  value?: string | null
  href?: string | null
  onCopy?: (() => void) | null
}) {
  if (!value?.trim()) return null

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border bg-background p-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-muted">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>

          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 inline-flex items-center gap-2 truncate text-sm font-semibold hover:underline"
              title={value}
            >
              <span className="truncate">{value}</span>
              <ExternalLink className="h-4 w-4 opacity-60" />
            </a>
          ) : (
            <p className="mt-0.5 truncate text-sm font-semibold" title={value}>
              {value}
            </p>
          )}
        </div>
      </div>

      {onCopy ? (
        <Button variant="ghost" size="sm" onClick={onCopy} className="shrink-0">
          Копировать
        </Button>
      ) : null}
    </div>
  )
}

export function UniversityProfile({ slug }: { slug: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["university", "slug", slug],
    queryFn: () => UniversityService.getBySlug(slug),
    enabled: !!slug,
  })

  const uni = data as UniversityItem | undefined

  if (isLoading) {
    return (
      <div className="mt-10 space-y-4">
        <Card style={{ backgroundColor: MAIN_COLOR }} className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-[55%]" />
                <Skeleton className="h-4 w-[35%]" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-9 w-28" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[420px] lg:col-span-2" />
          <Skeleton className="h-[420px]" />
        </div>
      </div>
    )
  }

  if (isError || !uni) {
    return (
      <Card className="mt-10 p-6">
        <CardTitle className="text-xl">Не удалось загрузить университет</CardTitle>
        <CardDescription className="mt-2">
          Попробуйте обновить страницу или вернуться позже.
        </CardDescription>
      </Card>
    )
  }

  const membersCount = uni._count?.memberships ?? 0
  const cityLine = [uni.city, uni.region].filter(Boolean).join(" • ")
  const inviteUrl = uni.inviteUrl?.trim() || null

  const links = uni.socialLinks ?? []
  const website =
    uni.websiteUrl?.trim() ||
    links.find((l) => l.type === "WEBSITE")?.url?.trim() ||
    null

  const admissionsUrl =
    uni.admissionsUrl?.trim() ||
    links.find((l) => (l.title ?? "").toLowerCase().includes("приём"))?.url?.trim() ||
    null

  const tags = (uni.tags ?? []).map((t) => t.value).filter(Boolean)

  return (
    <section className="mt-10 flex flex-col gap-4">
      {/* ВИТРИНА / HERO */}
      <Card style={{ backgroundColor: MAIN_COLOR }} className="relative overflow-hidden border-0">
        {/* фон */}
        <div className="pointer-events-none absolute inset-0">
          {uni.bannerUrl ? (
            <>
              <img
                src={uni.bannerUrl}
                alt=""
                className="h-full w-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/35" />
              <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-white/25" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
            </>
          )}
        </div>

        <CardContent className="relative p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <Avatar className="h-16 w-16 rounded-2xl ring-2 ring-white/40">
                <AvatarImage src={uni.avatarUrl ?? undefined} alt={uni.name} />
                <AvatarFallback className="rounded-2xl">
                  {getInitials(uni.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <CardTitle className="truncate text-2xl font-semibold text-[#1d2d44]">
                  {uni.name}
                </CardTitle>

                <div className="mt-2 flex flex-wrap gap-2">
                  <MetaChip icon={<Users className="h-4 w-4" />}>
                    Участников: {membersCount}
                  </MetaChip>

                  {cityLine ? (
                    <MetaChip icon={<MapPin className="h-4 w-4" />}>{cityLine}</MetaChip>
                  ) : null}

                  <Feature
                    active={!!uni.isState}
                    icon={<Landmark className="h-4 w-4" />}
                    label="Государственный"
                  />
                  <Feature
                    active={!!uni.hasDormitory}
                    icon={<Home className="h-4 w-4" />}
                    label="Общежитие"
                  />
                  <Feature
                    active={!!uni.hasMilitaryCenter}
                    icon={<Shield className="h-4 w-4" />}
                    label="Военный центр"
                  />
                  <Feature
                    active={!!uni.hasAccreditation}
                    icon={<BadgeCheck className="h-4 w-4" />}
                    label="Аккредитация"
                  />
                </div>

                {tags.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.slice(0, 10).map((t) => (
                      <Badge
                        key={t}
                        variant="outline"
                        className="border-[#344966]/40 bg-white/40 text-[#344966]"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                {uni.description ? (
                  <p className="mt-3 text-sm text-[#1d2d44]/80 line-clamp-2">
                    {uni.description}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {website ? (
                <Button asChild className="gap-2">
                  <a href={website} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Сайт
                  </a>
                </Button>
              ) : null}

              {admissionsUrl ? (
                <Button asChild variant="secondary" className="gap-2">
                  <a href={admissionsUrl} target="_blank" rel="noreferrer">
                    <GraduationCap className="h-4 w-4" />
                    Приёмная комиссия
                  </a>
                </Button>
              ) : null}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Link2 className="h-4 w-4" />
                    Ссылки
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Официальные ссылки</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {links.length ? (
                    links.map((l) => (
                      <DropdownMenuItem key={l.id} asChild>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between"
                        >
                          <span className="truncate">{linkTitle(l)}</span>
                          <ExternalLink className="h-4 w-4 opacity-60" />
                        </a>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      Пока нет ссылок.
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {inviteUrl ? (
                <InviteLinkDialog
                  inviteUrl={inviteUrl}
                  trigger={<Button variant="outline">Инвайт</Button>}
                />
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#1d2d44]/60">
            <span>Добавлен: {uni.createdAt ? formatDate(uni.createdAt) : "—"}</span>
            <span>Обновлён: {uni.updatedAt ? formatDate(uni.updatedAt) : "—"}</span>
          </div>
        </CardContent>
      </Card>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Профиль университета</CardTitle>
            <CardDescription>
              Вся нужная информация — без «технических» полей.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Обзор</TabsTrigger>
                <TabsTrigger value="contacts">Контакты</TabsTrigger>
                <TabsTrigger value="facts">Факты</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-3">
                <div className="rounded-2xl bg-muted/30 p-4">
                  <p className="text-sm font-semibold">О вузе</p>
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap break-words">
                    {uni.description || "Описание пока не добавлено."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-muted/30 p-4">
                    <p className="text-sm font-semibold">Статус</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={uni.status === "ACTIVE" ? "default" : "secondary"}>
                        {uni.status === "ACTIVE" ? "Активен" : "Приостановлен"}
                      </Badge>
                      {uni.timezone ? (
                        <Badge variant="outline" className="text-muted-foreground">
                          {uni.timezone}
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-muted/30 p-4">
                    <p className="text-sm font-semibold">Поступление</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {admissionsUrl ? "Есть страница приёмной комиссии." : "Ссылка приёмной комиссии не указана."}
                    </p>
                    {admissionsUrl ? (
                      <Button asChild variant="outline" className="mt-3 w-full justify-between">
                        <a href={admissionsUrl} target="_blank" rel="noreferrer">
                          Открыть страницу
                          <ExternalLink className="h-4 w-4 opacity-60" />
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contacts" className="mt-4 space-y-3">
                <ContactRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Адрес"
                  value={uni.address}
                  onCopy={uni.address ? () => copy(uni.address, "Адрес скопирован") : null}
                />
                <ContactRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Контактная почта"
                  value={uni.contactEmail}
                  onCopy={
                    uni.contactEmail ? () => copy(uni.contactEmail, "Почта скопирована") : null
                  }
                />
                <ContactRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Телефон"
                  value={uni.admissionsPhone}
                  onCopy={
                    uni.admissionsPhone ? () => copy(uni.admissionsPhone, "Телефон скопирован") : null
                  }
                />
                <ContactRow
                  icon={<GraduationCap className="h-4 w-4" />}
                  label="Почта приёмной комиссии"
                  value={uni.admissionsEmail}
                  onCopy={
                    uni.admissionsEmail ? () => copy(uni.admissionsEmail, "Почта скопирована") : null
                  }
                />
                <ContactRow
                  icon={<Link2 className="h-4 w-4" />}
                  label="Официальный сайт"
                  value={website}
                  href={website}
                  onCopy={website ? () => copy(website, "Ссылка скопирована") : null}
                />
              </TabsContent>

              <TabsContent value="facts" className="mt-4">
                {uni.facts?.length ? (
                  <ScrollArea className="h-[260px] pr-3">
                    <div className="space-y-2">
                      {uni.facts
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((f) => (
                          <div
                            key={f.id}
                            className="rounded-2xl border bg-background p-4"
                          >
                            <p className="text-xs text-muted-foreground">{f.label}</p>
                            <div className="mt-1 flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold break-words">
                                {f.value}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="shrink-0"
                                onClick={() => copy(f.value, "Скопировано")}
                              >
                                Копировать
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="rounded-2xl bg-muted/30 p-4 text-sm text-muted-foreground">
                    Пока нет фактов. Добавь 2–5 штук — и карточка сразу станет «живой».
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Side */}
        <div className="space-y-4">
          <Card className="bg-[#C7D9E5]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Быстрые ссылки</CardTitle>
              <CardDescription>Самое полезное — в один клик.</CardDescription>
            </CardHeader>

            <CardContent className="pt-0 space-y-2">
              {website ? (
                <Button asChild variant="outline" className="w-full justify-between">
                  <a href={website} target="_blank" rel="noreferrer">
                    Официальный сайт
                    <ExternalLink className="h-4 w-4 opacity-60" />
                  </a>
                </Button>
              ) : null}

              {admissionsUrl ? (
                <Button asChild variant="outline" className="w-full justify-between">
                  <a href={admissionsUrl} target="_blank" rel="noreferrer">
                    Приёмная комиссия
                    <ExternalLink className="h-4 w-4 opacity-60" />
                  </a>
                </Button>
              ) : null}

              {links
                .filter((l) => l.url && l.url !== website && l.url !== admissionsUrl)
                .slice(0, 4)
                .map((l) => (
                  <Button
                    key={l.id}
                    asChild
                    variant="secondary"
                    className="w-full justify-between"
                  >
                    <a href={l.url} target="_blank" rel="noreferrer">
                      {linkTitle(l)}
                      <ExternalLink className="h-4 w-4 opacity-60" />
                    </a>
                  </Button>
                ))}

              {!website && !admissionsUrl && !links.length ? (
                <div className="rounded-xl bg-muted/30 p-3 text-sm text-muted-foreground">
                  Пока нет ссылок.
                </div>
              ) : null}

              {inviteUrl ? (
                <>
                  <Separator className="my-2" />
                  <InviteLinkDialog
                    inviteUrl={inviteUrl}
                    trigger={
                      <Button className="w-full gap-2">
                        <Link2 className="h-4 w-4" />
                        Инвайт-ссылка
                      </Button>
                    }
                  />
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Контакты</CardTitle>
              <CardDescription>Быстро скопировать и отправить.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between"
                disabled={!uni.contactEmail}
                onClick={() =>
                  uni.contactEmail
                    ? copy(uni.contactEmail, "Почта скопирована")
                    : null
                }
              >
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {uni.contactEmail ? uni.contactEmail : "Почта не указана"}
                </span>
                <span className="text-muted-foreground">копировать</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between"
                disabled={!uni.admissionsPhone}
                onClick={() =>
                  uni.admissionsPhone
                    ? copy(uni.admissionsPhone, "Телефон скопирован")
                    : null
                }
              >
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {uni.admissionsPhone ? uni.admissionsPhone : "Телефон не указан"}
                </span>
                <span className="text-muted-foreground">копировать</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
