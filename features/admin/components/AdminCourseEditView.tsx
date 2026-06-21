"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Archive, ArrowLeft, BookOpen, ClipboardList, Layers3, Send } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confrim-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CourseForm } from "@/features/course/components/CourseForm"
import type { CourseScope, CreateCoursePayload } from "@/features/course/course.types"
import { useArchiveCourse, useManageableCourse, usePublishCourse, useUpdateCourse } from "@/features/course/hooks"

import { AdminEmptyState } from "./AdminEmptyState"
import { AdminPageHeader } from "./AdminPageHeader"

function normalizeScope(scope?: string | null): CourseScope {
  if (scope === "UNIVERSITY" || scope === "TEAM") return scope
  return "PUBLIC"
}

function getErrorStatus(error: unknown) {
  return (error as { response?: { status?: number } })?.response?.status
}

export function AdminCourseEditView({ courseId }: { courseId: string }) {
  const router = useRouter()
  const courseQuery = useManageableCourse(courseId)
  const updateCourse = useUpdateCourse()
  const publishCourse = usePublishCourse()
  const archiveCourse = useArchiveCourse()
  const course = courseQuery.data

  if (courseQuery.isLoading) {
    return (
      <section className="space-y-5">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-56 w-full" />
      </section>
    )
  }

  if (courseQuery.isError) {
    const status = getErrorStatus(courseQuery.error)
    const isNotFound = status === 404
    const isForbidden = status === 403

    return (
      <section className="space-y-4">
        <AdminEmptyState
          title={isNotFound ? "Курс не найден" : isForbidden ? "Нет доступа к курсу" : "Не удалось загрузить курс"}
          description={
            isNotFound
              ? "Курс с таким идентификатором не существует."
              : isForbidden
                ? "У вас нет прав на управление этим курсом."
                : "Проверьте соединение и повторите попытку."
          }
          icon={<BookOpen />}
        />
        <Button asChild variant="outline">
          <Link href="/admin/courses">К списку курсов</Link>
        </Button>
      </section>
    )
  }

  if (!course) {
    return (
      <section className="space-y-4">
        <AdminEmptyState
          title="Курс не найден"
          description="Сервис не вернул данные курса."
          icon={<BookOpen />}
        />
        <Button asChild variant="outline">
          <Link href="/admin/courses">К списку курсов</Link>
        </Button>
      </section>
    )
  }

  const editableCourse = course

  function handleSubmit(payload: CreateCoursePayload) {
    updateCourse.mutate(
      { id: editableCourse.id, payload },
      {
        onSuccess: () => {
          toast.success("Курс обновлён")
          router.push("/admin/courses")
        },
        onError: () => toast.error("Не удалось обновить курс"),
      },
    )
  }

  function handlePublish() {
    publishCourse.mutate(editableCourse.id, {
      onSuccess: () => toast.success("Курс опубликован"),
      onError: () => toast.error("Не удалось опубликовать курс"),
    })
  }

  function handleArchive() {
    archiveCourse.mutate(editableCourse.id, {
      onSuccess: () => toast.success("Курс перемещён в архив"),
      onError: () => toast.error("Не удалось архивировать курс"),
    })
  }

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title={`Редактирование: ${editableCourse.title ?? "Курс"}`}
        description="Измените основные данные и область доступа курса."
        actions={
          <>
            <Button asChild>
              <Link href={`/admin/courses/${editableCourse.id}/content`}>
                <Layers3 className="size-4" />
                Содержимое
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/admin/courses/${editableCourse.id}/assessments`}>
                <ClipboardList className="size-4" />
                Assessments
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/courses">
                <ArrowLeft className="size-4" />
                К курсам
              </Link>
            </Button>
          </>
        }
      />

      <CourseForm
        audience="admin"
        key={editableCourse.id}
        initialValues={{
          title: editableCourse.title ?? "",
          slug: editableCourse.slug ?? "",
          description: editableCourse.description ?? "",
          scope: normalizeScope(editableCourse.scope),
          universityId: editableCourse.universityId ?? "",
          teamId: editableCourse.teamId ?? "",
        }}
        submitLabel="Сохранить изменения"
        cancelHref="/admin/courses"
        isSubmitting={updateCourse.isPending}
        errorMessage={updateCourse.isError ? "Не удалось сохранить изменения. Проверьте введённые данные." : undefined}
        onSubmit={handleSubmit}
      />

      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Публикация</CardTitle>
          <CardDescription>Текущий статус: {editableCourse.status ?? "не указан"}.</CardDescription>
        </CardHeader>
        <CardContent>
          {editableCourse.status === "DRAFT" ? (
            <ConfirmDialog
              title="Опубликовать курс?"
              description="Курс станет доступен пользователям в соответствии с его scope."
              confirmText="Опубликовать"
              confirmVariant="default"
              isLoading={publishCourse.isPending}
              trigger={
                <Button type="button">
                  <Send className="size-4" />
                  Опубликовать
                </Button>
              }
              onConfirm={handlePublish}
            />
          ) : null}

          {editableCourse.status === "PUBLISHED" ? (
            <ConfirmDialog
              title="Архивировать курс?"
              description="Курс перестанет быть доступен для обычного прохождения."
              confirmText="Архивировать"
              isLoading={archiveCourse.isPending}
              trigger={
                <Button type="button" variant="outline">
                  <Archive className="size-4" />
                  Архивировать
                </Button>
              }
              onConfirm={handleArchive}
            />
          ) : null}

          {editableCourse.status === "ARCHIVED" ? (
            <p className="text-sm text-muted-foreground">Курс находится в архиве.</p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}
