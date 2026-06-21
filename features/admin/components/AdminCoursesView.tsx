"use client"

import * as React from "react"
import Link from "next/link"
import { Archive, BookOpen, ClipboardList, Layers3, Pencil, Plus, Search, Send } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confrim-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useArchiveCourse, usePublishCourse } from "@/features/course/hooks"

import { useAdminCourses } from "../hooks"
import type { AdminCourseScope, AdminCourseStatus } from "../admin.types"
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
const statusOptions: Array<{ value: "" | AdminCourseStatus; label: string }> = [
  { value: "", label: "Все статусы" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
]
const scopeOptions: Array<{ value: "" | AdminCourseScope; label: string }> = [
  { value: "", label: "Все scope" },
  { value: "PUBLIC", label: "Public" },
  { value: "UNIVERSITY", label: "University" },
  { value: "TEAM", label: "Team" },
]

export function AdminCoursesView() {
  const [page, setPage] = React.useState(1)
  const [q, setQ] = React.useState("")
  const [status, setStatus] = React.useState<"" | AdminCourseStatus>("")
  const [scope, setScope] = React.useState<"" | AdminCourseScope>("")
  const coursesQuery = useAdminCourses({ page, limit: PAGE_SIZE, q, status, scope })
  const publishCourse = usePublishCourse()
  const archiveCourse = useArchiveCourse()
  const courses = coursesQuery.data?.items ?? []
  const total = coursesQuery.data?.total ?? 0

  return (
    <section className="min-w-0 space-y-6">
      <AdminPageHeader
        title="Курсы"
        description="Курсы проекта: авторы, scope, статусы и охват."
        actions={
          <Button asChild>
            <Link href="/admin/courses/new">
              <Plus className="size-4" />
              Создать курс
            </Link>
          </Button>
        }
      />

      <Card className="border-border bg-card">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <div className="space-y-2">
            <Label htmlFor="admin-courses-q">Поиск</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-courses-q"
                className="bg-background pl-9"
                value={q}
                onChange={(event) => {
                  setQ(event.target.value)
                  setPage(1)
                }}
                placeholder="Название, slug или описание"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-courses-status">Статус</Label>
            <select
              id="admin-courses-status"
              className={adminSelectClassName}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as "" | AdminCourseStatus)
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
          <div className="space-y-2">
            <Label htmlFor="admin-courses-scope">Scope</Label>
            <select
              id="admin-courses-scope"
              className={adminSelectClassName}
              value={scope}
              onChange={(event) => {
                setScope(event.target.value as "" | AdminCourseScope)
                setPage(1)
              }}
            >
              {scopeOptions.map((item) => (
                <option key={item.label} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {coursesQuery.isLoading ? (
        <Card className="border-border bg-card">
          <CardContent className="space-y-3 p-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : coursesQuery.isError ? (
        <AdminEmptyState title="Не удалось загрузить курсы" icon={<BookOpen />} />
      ) : courses.length === 0 ? (
        <AdminEmptyState title="Курсы не найдены" icon={<BookOpen />} />
      ) : (
        <Card className="overflow-hidden border-border bg-card">
          <CardContent className="p-0">
            <Table className="min-w-[1350px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Курс</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Автор</TableHead>
                  <TableHead>University / Team</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Создан</TableHead>
                  <TableHead className="pr-5 text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="max-w-md pl-5 whitespace-normal">
                      <p className="font-medium text-foreground">{adminSafeText(course.title, "Без названия")}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{adminSafeText(course.description, "Описание не заполнено")}</p>
                    </TableCell>
                    <TableCell>
                      <AdminStatusBadge value={course.status} />
                    </TableCell>
                    <TableCell>
                      <AdminStatusBadge value={course.scope} />
                    </TableCell>
                    <TableCell>{adminUserName(course.author)}</TableCell>
                    <TableCell>
                      {adminSafeText(
                        course.university?.shortName ||
                          course.university?.name ||
                          course.team?.name,
                        "—",
                      )}
                    </TableCell>
                    <TableCell>{adminSafeNumber(course.enrollmentsCount)}</TableCell>
                    <TableCell className="text-muted-foreground">{adminFormatDate(course.createdAt)}</TableCell>
                    <TableCell className="pr-5">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/courses/${course.id}/edit`}>
                            <Pencil className="size-4" />
                            Редактировать
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/courses/${course.id}/content`}>
                            <Layers3 className="size-4" />
                            Контент
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/courses/${course.id}/assessments`}>
                            <ClipboardList className="size-4" />
                            Assessments
                          </Link>
                        </Button>

                        {course.status === "DRAFT" ? (
                          <ConfirmDialog
                            title="Опубликовать курс?"
                            description="Курс станет доступен пользователям в соответствии с его scope."
                            confirmText="Опубликовать"
                            confirmVariant="default"
                            isLoading={publishCourse.isPending && publishCourse.variables === course.id}
                            trigger={
                              <Button type="button" size="sm" variant="outline">
                                <Send className="size-4" />
                                Опубликовать
                              </Button>
                            }
                            onConfirm={() =>
                              publishCourse.mutate(course.id, {
                                onSuccess: () => toast.success("Курс опубликован"),
                                onError: () => toast.error("Не удалось опубликовать курс"),
                              })
                            }
                          />
                        ) : null}

                        {course.status === "PUBLISHED" ? (
                          <ConfirmDialog
                            title="Архивировать курс?"
                            description="Курс перестанет быть доступен для обычного прохождения."
                            confirmText="Архивировать"
                            isLoading={archiveCourse.isPending && archiveCourse.variables === course.id}
                            trigger={
                              <Button type="button" size="sm" variant="outline">
                                <Archive className="size-4" />
                                Архивировать
                              </Button>
                            }
                            onConfirm={() =>
                              archiveCourse.mutate(course.id, {
                                onSuccess: () => toast.success("Курс перемещён в архив"),
                                onError: () => toast.error("Не удалось архивировать курс"),
                              })
                            }
                          />
                        ) : null}
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
