"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, ClipboardList, Plus } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

import {
  useArchiveAssessment,
  useCourseAssessments,
  useManageableCourse,
  usePublishAssessment,
} from "../hooks"
import { AssessmentFormDialog } from "./AssessmentFormDialog"
import { AssessmentItemCard } from "./AssessmentItemCard"

function getErrorStatus(error: unknown) {
  return (error as { response?: { status?: number } })?.response?.status
}

export function CourseAssessmentsManager({
  courseId,
  backHref,
}: {
  courseId: string
  backHref: string
}) {
  const courseQuery = useManageableCourse(courseId)
  const assessmentsQuery = useCourseAssessments(courseId, Boolean(courseQuery.data))
  const publishAssessment = usePublishAssessment()
  const archiveAssessment = useArchiveAssessment()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedAssessmentId, setSelectedAssessmentId] = React.useState<string | null>(null)

  if (courseQuery.isLoading || assessmentsQuery.isLoading) {
    return (
      <section className="space-y-5">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
      </section>
    )
  }

  const queryError = courseQuery.error ?? assessmentsQuery.error
  if (queryError) {
    const status = getErrorStatus(queryError)
    const title = status === 404 ? "Курс не найден" : status === 403 ? "Нет доступа к курсу" : "Не удалось загрузить assessments"

    return (
      <section className="space-y-4">
        <Empty className="border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon"><ClipboardList /></EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>
              {status === 403
                ? "У вас нет прав на управление assessments этого курса."
                : "Проверьте адрес курса и соединение, затем повторите попытку."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
        <Button asChild variant="outline">
          <Link href={backHref}>Вернуться</Link>
        </Button>
      </section>
    )
  }

  const course = courseQuery.data
  if (!course) return null
  const assessments = assessmentsQuery.data ?? []

  function openCreateDialog() {
    setSelectedAssessmentId(null)
    setDialogOpen(true)
  }

  function openEditDialog(assessmentId: string) {
    setSelectedAssessmentId(assessmentId)
    setDialogOpen(true)
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-normal text-action">Bayanum Course Management</p>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
            Assessments: {course.title}
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Задания и экзамены курса, их публикация, дедлайны и ограничения попыток.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{course.status}</Badge>
            <Badge variant="outline">{course.scope}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={openCreateDialog}>
            <Plus className="size-4" />
            Добавить assessment
          </Button>
          <Button asChild variant="outline">
            <Link href={backHref}>
              <ArrowLeft className="size-4" />
              Назад к курсу
            </Link>
          </Button>
        </div>
      </header>

      {assessments.length === 0 ? (
        <Empty className="border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon"><ClipboardList /></EmptyMedia>
            <EmptyTitle>Assessments пока не добавлены</EmptyTitle>
            <EmptyDescription>Создайте первое задание или экзамен для курса.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {assessments.map((assessment) => (
            <AssessmentItemCard
              key={assessment.id}
              assessment={assessment}
              isPublishing={
                publishAssessment.isPending && publishAssessment.variables?.id === assessment.id
              }
              isArchiving={
                archiveAssessment.isPending && archiveAssessment.variables?.id === assessment.id
              }
              onEdit={() => openEditDialog(assessment.id)}
              onPublish={() =>
                publishAssessment.mutate(
                  { courseId, id: assessment.id },
                  {
                    onSuccess: () => toast.success("Assessment опубликован"),
                    onError: () => toast.error("Не удалось опубликовать assessment"),
                  },
                )
              }
              onArchive={() =>
                archiveAssessment.mutate(
                  { courseId, id: assessment.id },
                  {
                    onSuccess: () => toast.success("Assessment перемещён в архив"),
                    onError: () => toast.error("Не удалось архивировать assessment"),
                  },
                )
              }
            />
          ))}
        </div>
      )}

      <AssessmentFormDialog
        courseId={courseId}
        assessmentId={selectedAssessmentId}
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen)
          if (!nextOpen) setSelectedAssessmentId(null)
        }}
      />
    </section>
  )
}
