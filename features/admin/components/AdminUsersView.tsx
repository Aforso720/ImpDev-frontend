"use client"

import * as React from "react"
import Link from "next/link"
import { Eye, Search, Trash2, Users } from "lucide-react"

import { ConfirmDialog } from "@/components/confrim-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getInitials } from "@/lib/getInitials"

import { useAdminUsers, useDeleteAdminUser, useSetAdminUserRole } from "../hooks"
import type { AdminRole, AdminUserListItem } from "../admin.types"
import { AdminEmptyState } from "./AdminEmptyState"
import { AdminPagination } from "./AdminPagination"
import {
  AdminStatusBadge,
  adminFormatDate,
  adminSafeText,
  adminSelectClassName,
  adminUserName,
} from "./admin-ui"
import { AdminPageHeader } from "./AdminPageHeader"

const PAGE_SIZE = 20

const roleOptions: Array<{ value: "" | AdminRole; label: string }> = [
  { value: "", label: "Все роли" },
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
]

function UserRoleSelect({ user }: { user: AdminUserListItem }) {
  const mutation = useSetAdminUserRole()
  const currentRole = user.role === "ADMIN" ? "ADMIN" : "USER"
  const nextRole: AdminRole = currentRole === "ADMIN" ? "USER" : "ADMIN"

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AdminStatusBadge value={currentRole} />
      <ConfirmDialog
        title="Сменить глобальную роль?"
        description={`Пользователь получит роль ${nextRole}.`}
        confirmText={`Сделать ${nextRole}`}
        confirmVariant="default"
        isLoading={mutation.isPending}
        trigger={
          <Button type="button" size="sm" variant="outline">
            Сменить
          </Button>
        }
        onConfirm={() => mutation.mutate({ id: user.id, payload: { role: nextRole } })}
      />
    </div>
  )
}

export function AdminUsersView() {
  const [page, setPage] = React.useState(1)
  const [q, setQ] = React.useState("")
  const [role, setRole] = React.useState<"" | AdminRole>("")
  const usersQuery = useAdminUsers({ page, limit: PAGE_SIZE, q, role })
  const deleteUser = useDeleteAdminUser()
  const users = usersQuery.data?.items ?? []
  const total = usersQuery.data?.total ?? 0

  return (
    <section className="space-y-6">
      <AdminPageHeader title="Пользователи" description="Поиск, роли и базовые привязки пользователей." />

      <Card className="border-border bg-card">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-2">
            <Label htmlFor="admin-users-q">Поиск</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-users-q"
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
            <Label htmlFor="admin-users-role">Роль</Label>
            <select
              id="admin-users-role"
              className={adminSelectClassName}
              value={role}
              onChange={(event) => {
                setRole(event.target.value as "" | AdminRole)
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
        </CardContent>
      </Card>

      {usersQuery.isLoading ? (
        <Card className="border-border bg-card">
          <CardContent className="space-y-3 p-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : usersQuery.isError ? (
        <AdminEmptyState title="Не удалось загрузить пользователей" description="Проверьте доступ администратора." icon={<Users />} />
      ) : users.length === 0 ? (
        <AdminEmptyState title="Пользователи не найдены" description="Измените поиск или фильтр роли." icon={<Users />} />
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Пользователь</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Команда</TableHead>
                  <TableHead>Университет</TableHead>
                  <TableHead>Создан</TableHead>
                  <TableHead className="pr-5 text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const name = adminUserName(user)

                  return (
                    <TableRow key={user.id}>
                      <TableCell className="pl-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={user.avatarUrl ?? undefined} alt={name} />
                            <AvatarFallback>{getInitials(name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{name}</p>
                            <p className="truncate text-xs text-muted-foreground">{adminSafeText(user.email, "email не указан")}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <UserRoleSelect user={user} />
                      </TableCell>
                      <TableCell>{adminSafeText(user.team?.name, "—")}</TableCell>
                      <TableCell>{adminSafeText(user.university?.shortName || user.university?.name, "—")}</TableCell>
                      <TableCell className="text-muted-foreground">{adminFormatDate(user.createdAt)}</TableCell>
                      <TableCell className="pr-5">
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/users/${user.id}`}>
                              <Eye className="size-4" />
                              Открыть
                            </Link>
                          </Button>
                          <ConfirmDialog
                            title="Удалить пользователя?"
                            description="Это действие нельзя отменить."
                            confirmText="Удалить"
                            isLoading={deleteUser.isPending}
                            trigger={
                              <Button type="button" size="sm" variant="destructive">
                                <Trash2 className="size-4" />
                                Удалить
                              </Button>
                            }
                            onConfirm={() => deleteUser.mutate(user.id)}
                          />
                        </div>
                      </TableCell>
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
