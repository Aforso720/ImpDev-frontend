"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, GraduationCap, Trash2, UserRound } from "lucide-react"

import { ConfirmDialog } from "@/components/confrim-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getInitials } from "@/lib/getInitials"

import {
  useAdminTeams,
  useAdminUniversities,
  useAdminUser,
  useDeleteAdminUser,
  useSetAdminUserRole,
  useSetAdminUserTeam,
  useSetAdminUserUniversity,
} from "../hooks"
import type { AdminRole } from "../admin.types"
import { AdminEmptyState } from "./AdminEmptyState"
import { AdminPageHeader } from "./AdminPageHeader"
import {
  AdminStatusBadge,
  adminFormatDate,
  adminSafeNumber,
  adminSafeText,
  adminSelectClassName,
  adminUserName,
} from "./admin-ui"

export function AdminUserDetailView({ userId }: { userId: string }) {
  const router = useRouter()
  const userQuery = useAdminUser(userId)
  const roleMutation = useSetAdminUserRole()
  const teamMutation = useSetAdminUserTeam()
  const universityMutation = useSetAdminUserUniversity()
  const deleteMutation = useDeleteAdminUser()
  const teamsQuery = useAdminTeams({ page: 1, limit: 100 })
  const universitiesQuery = useAdminUniversities({ page: 1, limit: 100 })
  const user = userQuery.data
  const displayName = adminUserName(user)
  const [teamId, setTeamId] = React.useState("")
  const [universityId, setUniversityId] = React.useState("")

  const teamOptions = React.useMemo(() => {
    const items = teamsQuery.data?.items ?? []

    if (!user?.team?.id || items.some((team) => team.id === user.team?.id)) {
      return items
    }

    return [user.team, ...items]
  }, [teamsQuery.data?.items, user?.team])

  const universityOptions = React.useMemo(() => {
    const items = universitiesQuery.data?.items ?? []

    if (!user?.university?.id || items.some((university) => university.id === user.university?.id)) {
      return items
    }

    return [user.university, ...items]
  }, [universitiesQuery.data?.items, user?.university])

  React.useEffect(() => {
    if (!user) return
    setTeamId(user.teamId ?? user.team?.id ?? "")
    setUniversityId(user.university?.id ?? "")
  }, [user])

  if (userQuery.isLoading) {
    return (
      <section className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </section>
    )
  }

  if (userQuery.isError || !user) {
    return (
      <AdminEmptyState
        title="Пользователь не найден"
        description="Проверьте id пользователя или вернитесь к списку."
        icon={<UserRound />}
      />
    )
  }

  const currentRole = user.role === "ADMIN" ? "ADMIN" : "USER"
  const nextRole: AdminRole = currentRole === "ADMIN" ? "USER" : "ADMIN"

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title={displayName}
        description={adminSafeText(user.email, "Карточка пользователя")}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/users">
                <ArrowLeft className="size-4" />
                К пользователям
              </Link>
            </Button>
            <ConfirmDialog
              title="Удалить пользователя?"
              description="Это действие нельзя отменить."
              confirmText="Удалить"
              isLoading={deleteMutation.isPending}
              trigger={
                <Button type="button" variant="destructive">
                  <Trash2 className="size-4" />
                  Удалить
                </Button>
              }
              onConfirm={() =>
                deleteMutation.mutate(user.id, {
                  onSuccess: () => router.push("/admin/users"),
                })
              }
            />
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Базовые данные</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="size-14">
                <AvatarImage src={user.avatarUrl ?? undefined} alt={displayName} />
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-foreground">{displayName}</p>
                <p className="truncate text-sm text-muted-foreground">{adminSafeText(user.email, "email не указан")}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Глобальная роль</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <AdminStatusBadge value={currentRole} />
                  <ConfirmDialog
                    title="Сменить глобальную роль?"
                    description={`Пользователь получит роль ${nextRole}.`}
                    confirmText={`Сделать ${nextRole}`}
                    confirmVariant="default"
                    isLoading={roleMutation.isPending}
                    trigger={
                      <Button type="button" size="sm" variant="outline">
                        Сменить
                      </Button>
                    }
                    onConfirm={() => roleMutation.mutate({ id: user.id, payload: { role: nextRole } })}
                  />
                </div>
              </div>
              <div className="rounded-md border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Создан</p>
                <p className="mt-2 text-sm font-medium text-foreground">{adminFormatDate(user.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Счётчики</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Авторские курсы</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{adminSafeNumber(user._count?.authoredCourses)}</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Записи на курсы</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{adminSafeNumber(user._count?.enrollments)}</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Практики / attempts</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {adminSafeNumber(user._count?.practiceSubmissions)} / {adminSafeNumber(user._count?.assessmentAttempts)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Привязки</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="admin-user-team">Команда</Label>
            <div className="flex gap-2">
              <select
                id="admin-user-team"
                className={adminSelectClassName}
                value={teamId}
                disabled={teamsQuery.isLoading || teamMutation.isPending}
                onChange={(event) => setTeamId(event.target.value)}
              >
                <option value="">Без команды</option>
                {teamOptions.map((team) => (
                  <option key={team.id} value={team.id}>
                    {adminSafeText(team.name, team.id)}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                disabled={teamMutation.isPending || teamsQuery.isLoading}
                onClick={() => teamMutation.mutate({ id: user.id, payload: { teamId: teamId.trim() || null } })}
              >
                Сохранить
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Текущая команда: {adminSafeText(user.team?.name, "нет")}</p>
            <p className="text-xs text-muted-foreground">В списке показаны первые 100 команд из admin API.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-user-university">Университет</Label>
            <div className="flex gap-2">
              <select
                id="admin-user-university"
                className={adminSelectClassName}
                value={universityId}
                disabled={universitiesQuery.isLoading || universityMutation.isPending}
                onChange={(event) => setUniversityId(event.target.value)}
              >
                <option value="">Без университета</option>
                {universityOptions.map((university) => (
                  <option key={university.id} value={university.id}>
                    {adminSafeText(university.shortName || university.name, university.id)}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                disabled={universityMutation.isPending || universitiesQuery.isLoading}
                onClick={() =>
                  universityMutation.mutate({ id: user.id, payload: { universityId: universityId.trim() || null } })
                }
              >
                Сохранить
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Текущий университет: {adminSafeText(user.university?.shortName || user.university?.name, "нет")}
            </p>
            <p className="text-xs text-muted-foreground">В списке показаны первые 100 университетов из admin API.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">University memberships</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Университет</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="pr-5">Обновлено</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(user.universityMemberships ?? []).map((membership) => (
                <TableRow key={membership.id ?? `${membership.university?.id}-${membership.role}`}>
                  <TableCell className="pl-5">{adminSafeText(membership.university?.name, "—")}</TableCell>
                  <TableCell>
                    <AdminStatusBadge value={membership.role} />
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge value={membership.status} />
                  </TableCell>
                  <TableCell className="pr-5 text-muted-foreground">{adminFormatDate(membership.updatedAt)}</TableCell>
                </TableRow>
              ))}
              {(user.universityMemberships ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 text-muted-foreground">
                    Memberships не найдены.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="size-5" />
              Авторские курсы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(user.authoredCourses ?? []).map((course) => (
              <div key={course.id} className="rounded-md border border-border bg-background p-3">
                <p className="font-medium text-foreground">{adminSafeText(course.title, "Без названия")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <AdminStatusBadge value={course.status} />
                  <AdminStatusBadge value={course.scope} />
                </div>
              </div>
            ))}
            {(user.authoredCourses ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Курсов нет.</p> : null}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="size-5" />
              Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(user.enrollments ?? []).map((enrollment) => (
              <div key={enrollment.id} className="rounded-md border border-border bg-background p-3">
                <p className="font-medium text-foreground">{adminSafeText(enrollment.course?.title, "Курс не указан")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <AdminStatusBadge value={enrollment.status} />
                  <span className="text-xs text-muted-foreground">{adminFormatDate(enrollment.createdAt)}</span>
                </div>
              </div>
            ))}
            {(user.enrollments ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Записей нет.</p> : null}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
