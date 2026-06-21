"use client"

import Link from "next/link"
import { ArrowLeft, BookOpen, ClipboardCheck, ClipboardList, Layers3, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { useTeacherCourseProgress, useTeacherCourseStudents, useTeacherCourses } from "../hooks"
import { TeacherCourseProgressPanel } from "./TeacherCourseProgressPanel"
import { TeacherCourseStudentsTable } from "./TeacherCourseStudentsTable"
import { TeacherEmptyState } from "./TeacherEmptyState"
import { TeacherPageHeader } from "./TeacherPageHeader"
import { safeText, TeacherStatusBadge } from "./teacher-ui"

export function TeacherCourseDetailView({ courseId }: { courseId: string }) {
  const coursesQuery = useTeacherCourses()
  const progressQuery = useTeacherCourseProgress(courseId)
  const studentsQuery = useTeacherCourseStudents(courseId)
  const course = coursesQuery.data?.find((item) => item.id === courseId)

  if (coursesQuery.isLoading) {
    return (
      <section className="space-y-5">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </section>
    )
  }

  if (coursesQuery.isError || !course) {
    return (
      <section className="space-y-4">
        <TeacherEmptyState
          title={coursesQuery.isError ? "Не удалось загрузить курс" : "Курс не найден"}
          description={
            coursesQuery.isError
              ? "Проверьте соединение и повторите попытку."
              : "Курс отсутствует в списке доступных для управления."
          }
          icon={<BookOpen />}
        />
        <Button asChild variant="outline">
          <Link href="/teacher/courses">К списку курсов</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <TeacherPageHeader
        title={safeText(course?.title, "Курс")}
        description={safeText(course?.description, "Прогресс и список студентов курса.")}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/teacher/courses">
                <ArrowLeft className="size-4" />
                К курсам
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/teacher/courses/${courseId}/edit`}>
                <Pencil className="size-4" />
                Редактировать
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/teacher/courses/${courseId}/content`}>
                <Layers3 className="size-4" />
                Контент
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/teacher/submissions?courseId=${courseId}`}>
                <ClipboardCheck className="size-4" />
                Практики курса
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/teacher/courses/${courseId}/assessments`}>
                <ClipboardList className="size-4" />
                Assessments курса
              </Link>
            </Button>
          </>
        }
      />

      <Card className="border-border bg-card">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Краткая информация</p>
            <p className="font-medium text-foreground">
              {safeText(course?.university?.shortName || course?.university?.name || course?.team?.name, "Без привязки")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TeacherStatusBadge type="course" status={course?.status} />
            <span className="inline-flex items-center rounded-full border border-border bg-muted/35 px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {safeText(course?.scope, "scope не указан")}
            </span>
          </div>
        </CardContent>
      </Card>

      <TeacherCourseProgressPanel
        progress={progressQuery.data}
        isLoading={progressQuery.isLoading}
        isError={progressQuery.isError}
      />

      <TeacherCourseStudentsTable
        students={studentsQuery.data?.items}
        isLoading={studentsQuery.isLoading}
        isError={studentsQuery.isError}
      />
    </section>
  )
}
