"use client"

import * as React from "react"
import { CheckCircle2, Search, ShieldAlert, Trash2, XCircle } from "lucide-react"

import { ConfirmDialog } from "@/components/confrim-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import {
  useAdminTeams,
  useApproveAdminTeam,
  useDeleteAdminTeam,
  useRejectAdminTeam,
} from "../hooks"
import type { AdminState } from "../admin.types"
import { AdminEmptyState } from "./AdminEmptyState"
import { AdminPageHeader } from "./AdminPageHeader"
import { AdminPagination } from "./AdminPagination"
import {
  AdminStatusBadge,
  adminFormatDate,
  adminSafeNumber,
  adminSafeText,
  adminSelectClassName,
  adminUserName,
} from "./admin-ui"

const PAGE_SIZE = 20
const stateOptions: Array<{ value: "" | AdminState; label: string }> = [
  { value: "", label: "Все статусы" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
]

export function AdminTeamsView() {
  const [page, setPage] = React.useState(1)
  const [q, setQ] = React.useState("")
  const [status, setStatus] = React.useState<"" | AdminState>("")
  const teamsQuery = useAdminTeams({ page, limit: PAGE_SIZE, q, status })
  const approveTeam = useApproveAdminTeam()
  const rejectTeam = useRejectAdminTeam()
  const deleteTeam = useDeleteAdminTeam()
  const teams = teamsQuery.data?.items ?? []
  const total = teamsQuery.data?.total ?? 0

  return (
    <section className="min-w-0 space-y-6">
      <AdminPageHeader title="Команды" description="Модерация команд, лидеры и базовая статистика." />

      <Card className="border-border bg-card">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-2">
            <Label htmlFor="admin-teams-q">Поиск</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-teams-q"
                className="bg-background pl-9"
                value={q}
                onChange={(event) => {
                  setQ(event.target.value)
                  setPage(1)
                }}
                placeholder="Название или описание"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-teams-status">Статус</Label>
            <select
              id="admin-teams-status"
              className={adminSelectClassName}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as "" | AdminState)
                setPage(1)
              }}
            >
              {stateOptions.map((item) => (
                <option key={item.label} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {teamsQuery.isLoading ? (
        <Card className="border-border bg-card">
          <CardContent className="space-y-3 p-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : teamsQuery.isError ? (
        <AdminEmptyState title="Не удалось загрузить команды" icon={<ShieldAlert />} />
      ) : teams.length === 0 ? (
        <AdminEmptyState title="Команды не найдены" description="Измените поиск или фильтр." icon={<ShieldAlert />} />
      ) : (
        <Card className="overflow-hidden border-border bg-card">
          <CardContent className="p-0">
            <Table className="min-w-[1050px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Команда</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Лидер</TableHead>
                  <TableHead>Университет</TableHead>
                  <TableHead>Участники</TableHead>
                  <TableHead>Создана</TableHead>
                  <TableHead className="pr-5 text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="max-w-sm pl-5 whitespace-normal">
                      <p className="font-medium text-foreground">{adminSafeText(team.name, "Без названия")}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{adminSafeText(team.description, "Описание не заполнено")}</p>
                    </TableCell>
                    <TableCell>
                      <AdminStatusBadge value={team.status} />
                    </TableCell>
                    <TableCell>{adminUserName(team.leader)}</TableCell>
                    <TableCell>{adminSafeText(team.university?.shortName || team.university?.name, "—")}</TableCell>
                    <TableCell>{adminSafeNumber(team.membersCount)}</TableCell>
                    <TableCell className="text-muted-foreground">{adminFormatDate(team.createdAt)}</TableCell>
                    <TableCell className="pr-5">
                      <div className="flex justify-end gap-2">
                        {team.status === "PENDING" && (
                          <>
                            <ConfirmDialog
                              title="Одобрить команду?"
                              confirmText="Одобрить"
                              confirmVariant="default"
                              isLoading={approveTeam.isPending}
                              trigger={
                                <Button type="button" size="sm" variant="outline">
                                  <CheckCircle2 className="size-4 text-success" />
                                  Approve
                                </Button>
                              }
                              onConfirm={() => approveTeam.mutate(team.id)}
                            />
                            <ConfirmDialog
                              title="Отклонить команду?"
                              description="Команда получит статус REJECTED."
                              confirmText="Отклонить"
                              isLoading={rejectTeam.isPending}
                              trigger={
                                <Button type="button" size="sm" variant="outline">
                                  <XCircle className="size-4 text-error" />
                                  Reject
                                </Button>
                              }
                              onConfirm={() => rejectTeam.mutate(team.id)}
                            />
                          </>
                        )}
                        <ConfirmDialog
                          title="Удалить команду?"
                          description="У участников будет снята привязка к команде."
                          confirmText="Удалить"
                          isLoading={deleteTeam.isPending}
                          trigger={
                            <Button type="button" size="sm" variant="destructive">
                              <Trash2 className="size-4" />
                              Delete
                            </Button>
                          }
                          onConfirm={() => deleteTeam.mutate(team.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <AdminPagination page={page} limit={PAGE_SIZE} total={total} onPageChange={setPage} />
          </CardContent>
        </Card>
      )}
    </section>
  )
}
