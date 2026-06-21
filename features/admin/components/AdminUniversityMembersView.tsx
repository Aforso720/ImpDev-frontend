"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Search, Users } from "lucide-react"

import { ConfirmDialog } from "@/components/confrim-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getInitials } from "@/lib/getInitials"

import { useAdminUniversityMembers, useSetAdminUserUniversityRole } from "../hooks"
import type { AdminMembershipStatus, AdminUniversityMember, AdminUniversityRole } from "../admin.types"
import { AdminEmptyState } from "./AdminEmptyState"
import { AdminPageHeader } from "./AdminPageHeader"
import { AdminPagination } from "./AdminPagination"
import {
  AdminStatusBadge,
  adminFormatDate,
  adminSafeText,
  adminSelectClassName,
  adminUserName,
} from "./admin-ui"

const PAGE_SIZE = 20
const roleOptions: Array<{ value: "" | AdminUniversityRole; label: string }> = [
  { value: "", label: "Все роли" },
  { value: "LEADER", label: "Leader" },
  { value: "INSTRUCTOR", label: "Instructor" },
  { value: "STUDENT", label: "Student" },
]
const statusOptions: Array<{ value: "" | AdminMembershipStatus; label: string }> = [
  { value: "", label: "Все статусы" },
  { value: "ACTIVE", label: "Active" },
  { value: "BLOCKED", label: "Blocked" },
]

function UniversityMemberRoleControl({
  member,
  universityId,
}: {
  member: AdminUniversityMember
  universityId: string
}) {
  const roleMutation = useSetAdminUserUniversityRole()
  const currentRole = (member.role as AdminUniversityRole) ?? "STUDENT"
  const [selectedRole, setSelectedRole] = React.useState<AdminUniversityRole>(currentRole)

  React.useEffect(() => {
    setSelectedRole(currentRole)
  }, [currentRole])

  const isChanged = selectedRole !== currentRole
  const disabled = roleMutation.isPending || !member.user?.id

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className={adminSelectClassName}
        value={selectedRole}
        disabled={disabled}
        onChange={(event) => setSelectedRole(event.target.value as AdminUniversityRole)}
      >
        <option value="LEADER">Leader</option>
        <option value="INSTRUCTOR">Instructor</option>
        <option value="STUDENT">Student</option>
      </select>
      <ConfirmDialog
        title="Сменить роль участника?"
        description={`UniversityRole изменится с ${currentRole} на ${selectedRole}.`}
        confirmText="Сменить"
        confirmVariant="default"
        isLoading={roleMutation.isPending}
        trigger={
          <Button type="button" size="sm" variant="outline" disabled={disabled || !isChanged}>
            Сменить
          </Button>
        }
        onConfirm={() => {
          if (!member.user?.id || !isChanged) return
          roleMutation.mutate({
            id: member.user.id,
            payload: {
              universityId,
              role: selectedRole,
            },
          })
        }}
      />
    </div>
  )
}

export function AdminUniversityMembersView({ universityId }: { universityId: string }) {
  const [page, setPage] = React.useState(1)
  const [q, setQ] = React.useState("")
  const [role, setRole] = React.useState<"" | AdminUniversityRole>("")
  const [status, setStatus] = React.useState<"" | AdminMembershipStatus>("")
  const membersQuery = useAdminUniversityMembers(universityId, { page, limit: PAGE_SIZE, q, role, status })
  const members = membersQuery.data?.items ?? []
  const total = membersQuery.data?.total ?? 0

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Участники университета"
        description="Фильтры и смена UniversityRole на текущей схеме memberships."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/universities">
              <ArrowLeft className="size-4" />
              К университетам
            </Link>
          </Button>
        }
      />

      <Card className="border-border bg-card">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <div className="space-y-2">
            <Label htmlFor="admin-members-q">Поиск</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-members-q"
                className="bg-background pl-9"
                value={q}
                onChange={(event) => {
                  setQ(event.target.value)
                  setPage(1)
                }}
                placeholder="Имя или email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-members-role">Роль</Label>
            <select
              id="admin-members-role"
              className={adminSelectClassName}
              value={role}
              onChange={(event) => {
                setRole(event.target.value as "" | AdminUniversityRole)
                setPage(1)
              }}
            >
              {roleOptions.map((item) => (
                <option key={item.label} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-members-status">Статус</Label>
            <select
              id="admin-members-status"
              className={adminSelectClassName}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as "" | AdminMembershipStatus)
                setPage(1)
              }}
            >
              {statusOptions.map((item) => (
                <option key={item.label} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {membersQuery.isLoading ? (
        <Card className="border-border bg-card">
          <CardContent className="space-y-3 p-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : membersQuery.isError ? (
        <AdminEmptyState title="Не удалось загрузить участников" icon={<Users />} />
      ) : members.length === 0 ? (
        <AdminEmptyState title="Участники не найдены" icon={<Users />} />
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Пользователь</TableHead>
                  <TableHead>UniversityRole</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Команда</TableHead>
                  <TableHead className="pr-5">Обновлено</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const name = adminUserName(member.user)

                  return (
                    <TableRow key={member.id}>
                      <TableCell className="pl-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={member.user?.avatarUrl ?? undefined} alt={name} />
                            <AvatarFallback>{getInitials(name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {adminSafeText(member.user?.email, "email не указан")}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <UniversityMemberRoleControl member={member} universityId={universityId} />
                      </TableCell>
                      <TableCell>
                        <AdminStatusBadge value={member.status} />
                      </TableCell>
                      <TableCell>{adminSafeText(member.user?.team?.name, "—")}</TableCell>
                      <TableCell className="pr-5 text-muted-foreground">{adminFormatDate(member.updatedAt)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <AdminPagination page={page} limit={PAGE_SIZE} total={total} onPageChange={setPage} />
          </CardContent>
        </Card>
      )}
    </section>
  )
}
