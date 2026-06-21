"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Archive, ArrowLeft, BookOpen, ClipboardList, Layers3, Send } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CourseForm } from "@/features/course/components/CourseForm"
import { useArchiveCourse, useManageableCourse, usePublishCourse, useUpdateCourse } from "@/features/course/hooks"
import type { CourseScope, CreateCoursePayload } from "@/features/course/course.types"

import { TeacherEmptyState } from "./TeacherEmptyState"
import { TeacherPageHeader } from "./TeacherPageHeader"

function normalizeScope(scope?: string | null): CourseScope {
  if (scope === "UNIVERSITY" || scope === "TEAM") return scope
  return "PUBLIC"
}

function getErrorStatus(error: unknown) {
  return (error as { response?: { status?: number } })?.response?.status
}

export function TeacherCourseEditView({ courseId }: { courseId: string }) {
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
        <TeacherEmptyState
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
          <Link href="/teacher/courses">К списку курсов</Link>
        </Button>
      </section>
    )
  }

  if (!course) {
    return (
      <section className="space-y-4">
        <TeacherEmptyState
          title="Курс не найден"
          description="Сервис не вернул данные курса."
          icon={<BookOpen />}
        />
        <Button asChild variant="outline">
          <Link href="/teacher/courses">К списку курсов</Link>
        </Button>
      </section>
    )
  }

  const editableCourse = course
  const returnHref = `/teacher/courses/${editableCourse.id}`

  function handleSubmit(payload: CreateCoursePayload) {
    updateCourse.mutate(
      { id: editableCourse.id, payload },
      {
        onSuccess: () => {
          toast.success("Курс обновлён")
          router.push(returnHref)
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
      <TeacherPageHeader
        title={`Редактирование: ${editableCourse.title ?? "Курс"}`}
        description="Измените основные данные и область доступа курса."
        actions={
          <>
            <Button asChild>
              <Link href={`/teacher/courses/${editableCourse.id}/content`}>
                <Layers3 className="size-4" />
                Содержимое
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/teacher/courses/${editableCourse.id}/assessments`}>
                <ClipboardList className="size-4" />
                Assessments
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={returnHref}>
                <ArrowLeft className="size-4" />
                К курсу
              </Link>
            </Button>
          </>
        }
      />

      <CourseForm
        audience="teacher"
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
        cancelHref={returnHref}
        isSubmitting={updateCourse.isPending}
        errorMessage={updateCourse.isError ? "Не удалось сохранить изменения. Проверьте данные и права доступа." : undefined}
        onSubmit={handleSubmit}
      />

      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Публикация</CardTitle>
          <CardDescription>
            Текущий статус: {editableCourse.status ?? "не указан"}. Публикация делает курс доступным в соответствии с его scope.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editableCourse.status === "PUBLISHED" ? (
            <Button type="button" variant="outline" disabled={archiveCourse.isPending} onClick={handleArchive}>
              <Archive className="size-4" />
              Архивировать
            </Button>
          ) : editableCourse.status === "DRAFT" ? (
            <Button type="button" disabled={publishCourse.isPending} onClick={handlePublish}>
              <Send className="size-4" />
              Опубликовать
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Курс находится в архиве.</p>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
