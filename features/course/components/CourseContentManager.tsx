"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, BookOpenText, ClipboardList, Plus } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import {
  useDeletePracticeTask,
  useDeleteTheory,
  useManageableCourseContent,
} from "../hooks"
import type { CoursePracticeTask, CourseTheoryBlock } from "../course.types"
import { CourseContentItemCard } from "./CourseContentItemCard"
import { PracticeTaskFormDialog } from "./PracticeTaskFormDialog"
import { TheoryFormDialog } from "./TheoryFormDialog"

function getErrorStatus(error: unknown) {
  return (error as { response?: { status?: number } })?.response?.status
}

function getErrorMessage(error: unknown, fallback: string) {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
  if (Array.isArray(message)) return message.join(", ")
  return typeof message === "string" ? message : fallback
}

export function CourseContentManager({
  courseId,
  backHref,
}: {
  courseId: string
  backHref: string
}) {
  const contentQuery = useManageableCourseContent(courseId)
  const deleteTheory = useDeleteTheory()
  const deletePracticeTask = useDeletePracticeTask()
  const [theoryDialogOpen, setTheoryDialogOpen] = React.useState(false)
  const [practiceDialogOpen, setPracticeDialogOpen] = React.useState(false)
  const [selectedTheory, setSelectedTheory] = React.useState<CourseTheoryBlock | null>(null)
  const [selectedPracticeTask, setSelectedPracticeTask] = React.useState<CoursePracticeTask | null>(null)

  if (contentQuery.isLoading) {
    return (
      <section className="space-y-5">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </section>
    )
  }

  if (contentQuery.isError) {
    const status = getErrorStatus(contentQuery.error)
    const title = status === 404 ? "Курс не найден" : status === 403 ? "Нет доступа к курсу" : "Не удалось загрузить содержимое"

    return (
      <section className="space-y-4">
        <Empty className="border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon"><BookOpenText /></EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>
              {status === 403
                ? "У вас нет прав на управление содержимым этого курса."
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

  const course = contentQuery.data
  if (!course) return null

  const theory = [...course.theory].sort((a, b) => a.order - b.order)
  const practiceTasks = [...course.practiceTasks].sort((a, b) => a.order - b.order)
  const nextTheoryOrder = Math.max(0, ...theory.map((item) => item.order)) + 1
  const nextPracticeOrder = Math.max(0, ...practiceTasks.map((item) => item.order)) + 1

  function openNewTheory() {
    setSelectedTheory(null)
    setTheoryDialogOpen(true)
  }

  function openTheory(theoryBlock: CourseTheoryBlock) {
    setSelectedTheory(theoryBlock)
    setTheoryDialogOpen(true)
  }

  function openNewPracticeTask() {
    setSelectedPracticeTask(null)
    setPracticeDialogOpen(true)
  }

  function openPracticeTask(task: CoursePracticeTask) {
    setSelectedPracticeTask(task)
    setPracticeDialogOpen(true)
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-normal text-action">Bayanum Course Management</p>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
            Содержимое: {course.title}
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Теория и практические задания имеют независимый порядок внутри своих разделов.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{course.status}</Badge>
            <Badge variant="outline">{course.scope}</Badge>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href={backHref}>
            <ArrowLeft className="size-4" />
            Назад к курсу
          </Link>
        </Button>
      </header>

      <Card className="border-border bg-card text-card-foreground">
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2">
              <BookOpenText className="size-5 text-action" />
              Теория
            </CardTitle>
            <CardDescription>Markdown-блоки теоретического материала.</CardDescription>
          </div>
          <Button type="button" onClick={openNewTheory}>
            <Plus className="size-4" />
            Добавить теорию
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {theory.length === 0 ? (
            <Empty className="border-border bg-background py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon"><BookOpenText /></EmptyMedia>
                <EmptyTitle>Теория пока не добавлена</EmptyTitle>
                <EmptyDescription>Создайте первый теоретический блок курса.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            theory.map((item) => (
              <CourseContentItemCard
                key={item.id}
                kind="Теория"
                title={item.title}
                order={item.order}
                preview={item.contentMd}
                isDeleting={deleteTheory.isPending && deleteTheory.variables?.id === item.id}
                onEdit={() => openTheory(item)}
                onDelete={() =>
                  deleteTheory.mutate(
                    { courseId, id: item.id },
                    {
                      onSuccess: () => toast.success("Теоретический блок удалён"),
                      onError: (error) => toast.error(getErrorMessage(error, "Не удалось удалить теоретический блок")),
                    },
                  )
                }
              />
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card text-card-foreground">
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-5 text-action" />
              Практические задания
            </CardTitle>
            <CardDescription>Задания для самостоятельной работы и проверки.</CardDescription>
          </div>
          <Button type="button" onClick={openNewPracticeTask}>
            <Plus className="size-4" />
            Добавить практическое задание
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {practiceTasks.length === 0 ? (
            <Empty className="border-border bg-background py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon"><ClipboardList /></EmptyMedia>
                <EmptyTitle>Практических заданий пока нет</EmptyTitle>
                <EmptyDescription>Добавьте первое практическое задание курса.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            practiceTasks.map((item) => (
              <CourseContentItemCard
                key={item.id}
                kind="Практика"
                title={item.title}
                order={item.order}
                preview={item.statementMd}
                metadata={`${item.difficulty} · ${item.maxScore} баллов${item.stack.length ? ` · ${item.stack.join(", ")}` : ""}`}
                isDeleting={deletePracticeTask.isPending && deletePracticeTask.variables?.id === item.id}
                onEdit={() => openPracticeTask(item)}
                onDelete={() =>
                  deletePracticeTask.mutate(
                    { courseId, id: item.id },
                    {
                      onSuccess: () => toast.success("Практическое задание удалено"),
                      onError: (error) => toast.error(getErrorMessage(error, "Не удалось удалить практическое задание")),
                    },
                  )
                }
              />
            ))
          )}
        </CardContent>
      </Card>

      <TheoryFormDialog
        courseId={courseId}
        theory={selectedTheory}
        defaultOrder={nextTheoryOrder}
        open={theoryDialogOpen}
        onOpenChange={(nextOpen) => {
          setTheoryDialogOpen(nextOpen)
          if (!nextOpen) setSelectedTheory(null)
        }}
      />

      <PracticeTaskFormDialog
        courseId={courseId}
        task={selectedPracticeTask}
        defaultOrder={nextPracticeOrder}
        open={practiceDialogOpen}
        onOpenChange={(nextOpen) => {
          setPracticeDialogOpen(nextOpen)
          if (!nextOpen) setSelectedPracticeTask(null)
        }}
      />
    </section>
  )
}
