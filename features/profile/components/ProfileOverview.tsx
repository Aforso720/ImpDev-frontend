"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Building2, CheckCircle2, Mail, ShieldCheck, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TeamService } from "@/features/team/team.service"
import { UniversityService } from "@/features/university/university.service"
import { userService } from "@/lib/services/user.service"

const roleLabel: Record<string, string> = {
  ADMIN: "Администратор",
  USER: "Участник",
}

export function ProfileOverview() {
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", "me", "profile-page"],
    queryFn: () => userService.getProfile(),
  })

  const { data: universities = [], isLoading: isUniversitiesLoading } = useQuery({
    queryKey: ["university", "my", "profile-page"],
    queryFn: () => UniversityService.getMy(),
  })

  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ["team", "me", "profile-page"],
    queryFn: () => TeamService.getMeTeam(),
    enabled: !!user?.teamId,
    retry: 0,
  })

  const isLoading = isUserLoading || isUniversitiesLoading

  return (
    <section className="mx-auto w-full max-w-[980px] space-y-5 pb-6">
      <Card className="overflow-hidden border-border py-0">
        <CardHeader className="bg-brand-deep py-4">
          <Badge variant="secondary" className="w-fit bg-nuri-accent/15 text-white hover:bg-nuri-accent/15">
            Профиль
          </Badge>
          <CardTitle className="text-2xl text-white">
            {isUserLoading ? "Загрузка профиля..." : user?.name || "Пользователь"}
          </CardTitle>
          <CardDescription className="text-white/85">
            Личный контур в Bayanum: роль, связи с университетом и участие в сообществах.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-4 w-4" />
              Основные данные
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : (
              <>
                <div className="rounded-xl bg-muted/45 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Email</p>
                  <p className="mt-1 font-medium text-foreground">{user?.email}</p>
                </div>
                <div className="rounded-xl bg-muted/45 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Роль</p>
                  <p className="mt-1 font-medium text-foreground">{roleLabel[user?.role ?? "USER"]}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-4 w-4" />
              Связи в экосистеме
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isUniversitiesLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : (
              <>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Университет</p>
                  <p className="mt-1 font-medium text-foreground">{universities[0]?.name ?? "Не привязан"}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Сообщество</p>
                  <p className="mt-1 font-medium text-foreground">
                    {isTeamLoading ? "Проверяем..." : team?.name || "Не привязан"}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-4 w-4" />
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Button asChild variant="outline" className="justify-start">
            <Link href="/courses">
              <ShieldCheck className="h-4 w-4" />
              Перейти к курсам
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/university">
              <Building2 className="h-4 w-4" />
              Перейти к вузам
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/team">
              <Users className="h-4 w-4" />
              Перейти в сообщества
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
