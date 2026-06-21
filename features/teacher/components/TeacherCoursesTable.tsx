"use client"

import Link from "next/link"
import { Archive, BookOpen, ClipboardList, ExternalLink, Layers3, Pencil, Send } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confrim-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useArchiveCourse, usePublishCourse } from "@/features/course/hooks"

import type { TeacherCourse } from "../teacher.types"
import { TeacherEmptyState } from "./TeacherEmptyState"
import { formatTeacherDate, safeNumber, safeText, TeacherStatusBadge } from "./teacher-ui"

export function TeacherCoursesTable({
  courses,
  isLoading,
  isError,
}: {
  courses?: TeacherCourse[]
  isLoading?: boolean
  isError?: boolean
}) {
  const publishCourse = usePublishCourse()
  const archiveCourse = useArchiveCourse()

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="space-y-3 p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <TeacherEmptyState
        title="Не удалось загрузить курсы"
        description="Проверьте соединение и повторите попытку."
        icon={<BookOpen />}
      />
    )
  }

  if (!courses?.length) {
    return (
      <TeacherEmptyState
        title="Курсы для преподавателя не найдены"
        description="Здесь появятся курсы, где вы автор или преподаватель университета."
        icon={<BookOpen />}
      />
    )
  }

  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardContent className="p-0">
        <Table className="min-w-[1250px]">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Курс</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Студенты</TableHead>
              <TableHead>Практики</TableHead>
              <TableHead>Тесты</TableHead>
              <TableHead>Обновлен</TableHead>
              <TableHead className="pr-5 text-right">Действие</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="max-w-md pl-5 whitespace-normal">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{safeText(course.title, "Без названия")}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{safeText(course.description, "Описание не заполнено")}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <TeacherStatusBadge type="course" status={course.status} />
                </TableCell>
                <TableCell>{safeNumber(course.studentsTotal)}</TableCell>
                <TableCell>{safeNumber(course.practiceTasksTotal)}</TableCell>
                <TableCell>{safeNumber(course.assessmentsTotal)}</TableCell>
                <TableCell className="text-muted-foreground">{formatTeacherDate(course.updatedAt)}</TableCell>
                <TableCell className="pr-5">
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/teacher/courses/${course.id}`}>
                        <ExternalLink className="size-4" />
                        Открыть
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/teacher/courses/${course.id}/edit`}>
                        <Pencil className="size-4" />
                        Редактировать
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/teacher/courses/${course.id}/content`}>
                        <Layers3 className="size-4" />
                        Контент
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/teacher/courses/${course.id}/assessments`}>
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
                          <Button type="button" size="sm">
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
      </CardContent>
    </Card>
  )
}
