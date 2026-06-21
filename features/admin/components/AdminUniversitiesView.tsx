"use client"

import * as React from "react"
import Link from "next/link"
import { Building2, Search, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { useAdminUniversities } from "../hooks"
import { AdminEmptyState } from "./AdminEmptyState"
import { AdminPageHeader } from "./AdminPageHeader"
import { AdminPagination } from "./AdminPagination"
import { AdminStatusBadge, adminSafeNumber, adminSafeText } from "./admin-ui"

const PAGE_SIZE = 20

export function AdminUniversitiesView() {
  const [page, setPage] = React.useState(1)
  const [q, setQ] = React.useState("")
  const universitiesQuery = useAdminUniversities({ page, limit: PAGE_SIZE, q })
  const universities = universitiesQuery.data?.items ?? []
  const total = universitiesQuery.data?.total ?? 0

  return (
    <section className="min-w-0 space-y-6">
      <AdminPageHeader title="Университеты" description="Список университетов и быстрый переход к участникам." />

      <Card className="border-border bg-card">
        <CardContent className="p-5">
          <div className="space-y-2">
            <Label htmlFor="admin-universities-q">Поиск</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-universities-q"
                className="bg-background pl-9"
                value={q}
                onChange={(event) => {
                  setQ(event.target.value)
                  setPage(1)
                }}
                placeholder="Название, slug, город или регион"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {universitiesQuery.isLoading ? (
        <Card className="border-border bg-card">
          <CardContent className="space-y-3 p-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : universitiesQuery.isError ? (
        <AdminEmptyState title="Не удалось загрузить университеты" icon={<Building2 />} />
      ) : universities.length === 0 ? (
        <AdminEmptyState title="Университеты не найдены" icon={<Building2 />} />
      ) : (
        <Card className="overflow-hidden border-border bg-card">
          <CardContent className="p-0">
            <Table className="min-w-[850px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Университет</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Регион</TableHead>
                  <TableHead className="pr-5 text-right">Действие</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {universities.map((university) => (
                  <TableRow key={university.id}>
                    <TableCell className="pl-5">
                      <p className="font-medium text-foreground">{adminSafeText(university.name, "Без названия")}</p>
                      <p className="text-xs text-muted-foreground">{adminSafeText(university.slug, "slug не указан")}</p>
                    </TableCell>
                    <TableCell>
                      <AdminStatusBadge value={university.status} />
                    </TableCell>
                    <TableCell>{adminSafeNumber(university.usersCount)}</TableCell>
                    <TableCell>{adminSafeNumber(university.teamsCount)}</TableCell>
                    <TableCell>{adminSafeNumber(university.coursesCount)}</TableCell>
                    <TableCell>{adminSafeText(university.region || university.city, "—")}</TableCell>
                    <TableCell className="pr-5 text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/universities/${university.id}/members`}>
                          <Users className="size-4" />
                          Участники
                        </Link>
                      </Button>
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
