"use client"

import type { ReactNode } from "react"
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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MAIN_COLOR } from "@/lib/constants/colors.constants"
import { formatDate } from "@/lib/format-date"
import { getInitials } from "@/lib/getInitials"

import { UniversityService } from "../university.service"
import type { UniversityItem, UniversitySocialLink } from "../university.types"
import { InviteLinkDialog } from "./InviteLinkDialog"

function linkTitle(link: UniversitySocialLink) {
  const title = link.title?.trim()
  if (title) return title

  switch (link.type) {
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

function normalizeUrl(url?: string | null) {
  const value = (url ?? "").trim()
  if (!value) return null
  return value.replace(/\/+$/, "").toLowerCase()
}

function copy(text: string, okText: string) {
  if (!text?.trim()) return

  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(okText))
    .catch(() => toast.error("Не удалось скопировать"))
}

function MetaChip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/25 bg-black/25 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
      <span className="opacity-80">{icon}</span>
      <span className="truncate">{children}</span>
    </div>
  )
}

function Feature({ active, icon, label }: { active: boolean; icon: ReactNode; label: string }) {
  if (!active) return null

  return (
    <Badge variant="outline" className="gap-2 border-white/25 bg-white/12 text-white">
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
  icon: ReactNode
  label: string
  value?: string | null
  href?: string | null
  onCopy?: (() => void) | null
}) {
  if (!value?.trim()) return null

  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted">{icon}</div>

          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>

            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                title={value}
              >
                <span className="break-all">{value}</span>
                <ExternalLink className="h-4 w-4 shrink-0 opacity-60" />
              </a>
            ) : (
              <p className="mt-0.5 text-sm font-semibold break-words" title={value}>
                {value}
              </p>
            )}
          </div>
        </div>

        {onCopy ? (
          <Button variant="ghost" size="sm" onClick={onCopy} className="shrink-0 self-start">
            Копировать
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function InfoTile({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode
  label: string
  value: string
  description?: string
}) {
  return (
    <div className="rounded-2xl border bg-muted/25 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 flex items-start gap-2 text-sm font-semibold">
        <span className="mt-[1px] shrink-0 opacity-80">{icon}</span>
        <span className="break-words">{value}</span>
      </p>
      {description ? <p className="mt-1 text-xs text-muted-foreground break-words">{description}</p> : null}
    </div>
  )
}

function ExternalActionButton({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Button asChild variant="outline" className="h-auto w-full justify-between gap-2 whitespace-normal py-2 text-left">
      <a href={href} target="_blank" rel="noreferrer">
        <span className="flex min-w-0 items-center gap-2">
          <span className="shrink-0">{icon}</span>
          <span className="break-words">{label}</span>
        </span>
        <ExternalLink className="h-4 w-4 shrink-0 opacity-60" />
      </a>
    </Button>
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
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
          <Skeleton className="h-[280px]" />
          <Skeleton className="h-[280px]" />
          <Skeleton className="h-[280px]" />
        </div>
        <Skeleton className="h-[520px]" />
      </div>
    )
  }

  if (isError || !uni) {
    return (
      <Card className="mt-10">
        <CardContent className="p-6">
          <CardTitle className="text-xl">Не удалось загрузить университет</CardTitle>
          <CardDescription className="mt-2">Попробуйте обновить страницу или вернуться позже.</CardDescription>
        </CardContent>
      </Card>
    )
  }

  const membersCount = uni._count?.memberships ?? 0
  const cityLine = [uni.city, uni.region].filter(Boolean).join(" • ")
  const inviteUrl = uni.inviteUrl?.trim() || null

  const links = uni.socialLinks ?? []
  const website =
    uni.websiteUrl?.trim() ||
    links.find((link) => link.type === "WEBSITE")?.url?.trim() ||
    null

  const admissionsUrl =
    uni.admissionsUrl?.trim() ||
    links.find((link) => (link.title ?? "").toLowerCase().includes("прием"))?.url?.trim() ||
    null

  const tags = (uni.tags ?? []).map((tag) => tag.value).filter(Boolean)

  const websiteNorm = normalizeUrl(website)
  const admissionsNorm = normalizeUrl(admissionsUrl)

  const externalLinks = links
    .map((link) => ({ ...link, url: link.url?.trim() ?? "" }))
    .filter((link) => {
      const normalized = normalizeUrl(link.url)
      return !!normalized && normalized !== websiteNorm && normalized !== admissionsNorm
    })

  const facts = (uni.facts ?? []).slice().sort((a, b) => a.order - b.order)
  const address = uni.address?.trim() || null
  const contactEmail = uni.contactEmail?.trim() || null
  const admissionsPhone = uni.admissionsPhone?.trim() || null
  const admissionsEmail = uni.admissionsEmail?.trim() || null
  const partnershipsEmail = uni.partnershipsEmail?.trim() || null

  return (
    <section className="mt-10 flex min-w-0 flex-col gap-4">
      <header className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
        <Card style={{ backgroundColor: MAIN_COLOR }} className="relative min-w-0 overflow-hidden border-0 py-0">
          <div className="pointer-events-none absolute inset-0">
            {uni.bannerUrl ? (
              <>
                <img src={uni.bannerUrl} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
              </>
            ) : (
              <>
                <div className="absolute -right-16 -top-12 h-56 w-56 rounded-full bg-white/20" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-white/15" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
              </>
            )}
          </div>

          <CardContent className="relative p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-white/70">Профиль университета</p>

            <div className="mt-3 flex min-w-0 items-start gap-4">
              <Avatar className="h-16 w-16 shrink-0 rounded-2xl ring-2 ring-white/45">
                <AvatarImage src={uni.avatarUrl ?? undefined} alt={uni.name} />
                <AvatarFallback className="rounded-2xl">{getInitials(uni.name)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <CardTitle className="break-words text-2xl text-white">{uni.name}</CardTitle>

                <div className="mt-3 flex flex-wrap gap-2">
                  <MetaChip icon={<Users className="h-4 w-4" />}>Участников: {membersCount}</MetaChip>
                  {cityLine ? <MetaChip icon={<MapPin className="h-4 w-4" />}>{cityLine}</MetaChip> : null}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Feature active={!!uni.isState} icon={<Landmark className="h-4 w-4" />} label="Государственный" />
                  <Feature active={!!uni.hasDormitory} icon={<Home className="h-4 w-4" />} label="Общежитие" />
                  <Feature active={!!uni.hasMilitaryCenter} icon={<Shield className="h-4 w-4" />} label="Военный центр" />
                  <Feature active={!!uni.hasAccreditation} icon={<BadgeCheck className="h-4 w-4" />} label="Аккредитация" />
                </div>

                {tags.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.slice(0, 8).map((tag) => (
                      <Badge key={tag} variant="outline" className="border-white/30 bg-white/12 text-white">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 bg-brand-panel py-0 text-ink-inverse">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-ink-inverse">Описание университета</CardTitle>
            <CardDescription className="text-ink-inverse/70">
              Блок отделён от шапки, как в профиле команды, чтобы структура читалась легче.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            <p className="max-h-32 overflow-y-auto pr-1 text-sm text-ink-inverse/85 whitespace-pre-wrap break-words">
              {uni.description || "Описание пока не заполнено."}
            </p>

            <div className="grid gap-2 text-xs sm:grid-cols-2">
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-ink-inverse/65">Статус</p>
                <p className="mt-1 font-semibold">{uni.status === "ACTIVE" ? "Активен" : "Приостановлен"}</p>
              </div>

              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-ink-inverse/65">Часовой пояс</p>
                <p className="mt-1 font-semibold break-words">{uni.timezone || "Не указан"}</p>
              </div>

              <div className="rounded-xl bg-white/10 p-3 sm:col-span-2">
                <p className="text-ink-inverse/65">Обновление профиля</p>
                <p className="mt-1 font-semibold">Обновлён: {uni.updatedAt ? formatDate(uni.updatedAt) : "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 bg-[#C7D9E5] py-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Действия</CardTitle>
            <CardDescription>Ссылки и инвайт собраны в одном блоке без повторов.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-2 pt-0">
            {website ? (
              <ExternalActionButton href={website} icon={<ExternalLink className="h-4 w-4" />} label="Официальный сайт" />
            ) : null}

            {admissionsUrl ? (
              <ExternalActionButton
                href={admissionsUrl}
                icon={<GraduationCap className="h-4 w-4" />}
                label="Приёмная комиссия"
              />
            ) : null}

            {externalLinks.slice(0, 4).map((link) => (
              <ExternalActionButton key={link.id} href={link.url} icon={<Link2 className="h-4 w-4" />} label={linkTitle(link)} />
            ))}

            {!website && !admissionsUrl && !externalLinks.length ? (
              <div className="rounded-xl bg-muted/30 p-3 text-sm text-muted-foreground">Пока нет внешних ссылок.</div>
            ) : null}

            {inviteUrl ? (
              <InviteLinkDialog
                inviteUrl={inviteUrl}
                trigger={
                  <Button className="mt-1 w-full gap-2">
                    <Link2 className="h-4 w-4" />
                    Инвайт-ссылка
                  </Button>
                }
              />
            ) : null}
          </CardContent>
        </Card>
      </header>

      <Card className="min-w-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Профиль университета</CardTitle>
          <CardDescription>Вкладки адаптированы под узкие экраны без горизонтального скролла.</CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <Tabs defaultValue="overview">
            <TabsList className="grid h-auto w-full grid-cols-1 gap-2 sm:h-9 sm:grid-cols-3 sm:gap-0">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="contacts">Контакты</TabsTrigger>
              <TabsTrigger value="facts">Факты</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoTile
                  icon={<MapPin className="h-4 w-4" />}
                  label="Расположение"
                  value={cityLine || "Не указано"}
                  description={uni.address || "Адрес не указан"}
                />

                <InfoTile
                  icon={<Users className="h-4 w-4" />}
                  label="Участники"
                  value={`${membersCount}`}
                  description="Количество активных связей с университетом"
                />

                <InfoTile
                  icon={<GraduationCap className="h-4 w-4" />}
                  label="Поступление"
                  value={admissionsUrl ? "Страница приёмной комиссии доступна" : "Ссылка не указана"}
                  description={admissionsUrl || "Добавьте ссылку на приёмную комиссию в профиле"}
                />

                <InfoTile
                  icon={<BadgeCheck className="h-4 w-4" />}
                  label="Дата создания"
                  value={uni.createdAt ? formatDate(uni.createdAt) : "—"}
                  description={`Slug: ${uni.slug}`}
                />
              </div>

              {tags.length ? (
                <div className="rounded-2xl bg-muted/25 p-4">
                  <p className="text-sm font-semibold">Теги университета</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-muted/25 p-4 text-sm text-muted-foreground">
                  Теги пока не добавлены.
                </div>
              )}
            </TabsContent>

            <TabsContent value="contacts" className="mt-4 space-y-3">
              <ContactRow
                icon={<MapPin className="h-4 w-4" />}
                label="Адрес"
                value={address}
                onCopy={address ? () => copy(address, "Адрес скопирован") : null}
              />

              <ContactRow
                icon={<Mail className="h-4 w-4" />}
                label="Контактная почта"
                value={contactEmail}
                onCopy={contactEmail ? () => copy(contactEmail, "Почта скопирована") : null}
              />

              <ContactRow
                icon={<Phone className="h-4 w-4" />}
                label="Телефон приёмной комиссии"
                value={admissionsPhone}
                onCopy={admissionsPhone ? () => copy(admissionsPhone, "Телефон скопирован") : null}
              />

              <ContactRow
                icon={<GraduationCap className="h-4 w-4" />}
                label="Почта приёмной комиссии"
                value={admissionsEmail}
                onCopy={admissionsEmail ? () => copy(admissionsEmail, "Почта скопирована") : null}
              />

              <ContactRow
                icon={<Mail className="h-4 w-4" />}
                label="Почта для партнёрств"
                value={partnershipsEmail}
                onCopy={
                  partnershipsEmail
                    ? () => copy(partnershipsEmail, "Почта для партнёрств скопирована")
                    : null
                }
              />
            </TabsContent>

            <TabsContent value="facts" className="mt-4">
              {facts.length ? (
                <ScrollArea className="h-[300px] pr-3">
                  <div className="space-y-2">
                    {facts.map((fact) => (
                      <div key={fact.id} className="rounded-2xl border bg-background p-4">
                        <p className="text-xs text-muted-foreground">{fact.label}</p>
                        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <p className="text-sm font-semibold break-words">{fact.value}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 self-start"
                            onClick={() => copy(fact.value, "Скопировано")}
                          >
                            Копировать
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="rounded-2xl bg-muted/25 p-4 text-sm text-muted-foreground">
                  Пока нет фактов. Добавьте 2-5 ключевых фактов, чтобы профиль выглядел живее.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  )
}
