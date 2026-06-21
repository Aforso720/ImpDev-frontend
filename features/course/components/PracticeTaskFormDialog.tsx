"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { useCreatePracticeTask, useUpdatePracticeTask } from "../hooks"
import type { CoursePracticeTask, CreatePracticeTaskPayload, PracticeDifficulty } from "../course.types"

type PracticeTaskFormValues = {
  title: string
  statementMd: string
  stack: string
  difficulty: PracticeDifficulty
  maxScore: number
  order: number
  timeLimitMs: string
  memoryLimitMb: string
  externalRef: string
}

const selectClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px]"

function optionalPositiveInteger(value: string) {
  if (!value.trim()) return true
  const number = Number(value)
  return (Number.isInteger(number) && number >= 1) || "Укажите целое число не меньше 1"
}

export function PracticeTaskFormDialog({
  courseId,
  task,
  defaultOrder,
  open,
  onOpenChange,
}: {
  courseId: string
  task?: CoursePracticeTask | null
  defaultOrder: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createTask = useCreatePracticeTask()
  const updateTask = useUpdatePracticeTask()
  const isEditing = Boolean(task)
  const isPending = createTask.isPending || updateTask.isPending
  const mutationError = createTask.isError || updateTask.isError
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PracticeTaskFormValues>()

  React.useEffect(() => {
    if (!open) return
    reset({
      title: task?.title ?? "",
      statementMd: task?.statementMd ?? "",
      stack: task?.stack?.join(", ") ?? "",
      difficulty: task?.difficulty ?? "MEDIUM",
      maxScore: task?.maxScore ?? 100,
      order: task?.order ?? defaultOrder,
      timeLimitMs: task?.timeLimitMs ? String(task.timeLimitMs) : "",
      memoryLimitMb: task?.memoryLimitMb ? String(task.memoryLimitMb) : "",
      externalRef: task?.externalRef ?? "",
    })
  }, [defaultOrder, open, reset, task])

  const submit = handleSubmit((values) => {
    const payload: CreatePracticeTaskPayload = {
      title: values.title.trim(),
      statementMd: values.statementMd.trim(),
      stack: values.stack.split(",").map((item) => item.trim()).filter(Boolean),
      difficulty: values.difficulty,
      maxScore: values.maxScore,
      order: values.order,
    }

    if (values.timeLimitMs.trim()) payload.timeLimitMs = Number(values.timeLimitMs)
    if (values.memoryLimitMb.trim()) payload.memoryLimitMb = Number(values.memoryLimitMb)
    if (values.externalRef.trim()) payload.externalRef = values.externalRef.trim()

    if (task) {
      updateTask.mutate(
        { courseId, id: task.id, payload },
        {
          onSuccess: () => {
            toast.success("Практическое задание обновлено")
            onOpenChange(false)
          },
          onError: () => toast.error("Не удалось обновить практическое задание"),
        },
      )
      return
    }

    createTask.mutate(
      { courseId, payload },
      {
        onSuccess: () => {
          toast.success("Практическое задание добавлено")
          onOpenChange(false)
        },
        onError: () => toast.error("Не удалось добавить практическое задание"),
      },
    )
  })

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Редактирование практики" : "Новое практическое задание"}</DialogTitle>
          <DialogDescription>Условие, оценивание и порядок внутри списка практических заданий.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="practice-title">Название</Label>
            <Input
              id="practice-title"
              aria-invalid={Boolean(errors.title)}
              {...register("title", {
                validate: (value) => {
                  const length = value.trim().length
                  if (length < 3) return "Минимум 3 символа"
                  if (length > 200) return "Максимум 200 символов"
                  return true
                },
              })}
            />
            {errors.title ? <p className="text-sm text-error">{errors.title.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="practice-statement">Условие Markdown</Label>
            <Textarea
              id="practice-statement"
              className="min-h-48 resize-y"
              aria-invalid={Boolean(errors.statementMd)}
              {...register("statementMd", {
                validate: (value) => {
                  const length = value.trim().length
                  if (length < 1) return "Добавьте условие"
                  if (length > 50000) return "Максимум 50000 символов"
                  return true
                },
              })}
            />
            {errors.statementMd ? <p className="text-sm text-error">{errors.statementMd.message}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="practice-order">Порядок</Label>
              <Input
                id="practice-order"
                type="number"
                min={1}
                aria-invalid={Boolean(errors.order)}
                {...register("order", {
                  valueAsNumber: true,
                  required: "Укажите порядок",
                  min: { value: 1, message: "Минимум 1" },
                })}
              />
              {errors.order ? <p className="text-sm text-error">{errors.order.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="practice-max-score">Максимальный балл</Label>
              <Input
                id="practice-max-score"
                type="number"
                min={0}
                aria-invalid={Boolean(errors.maxScore)}
                {...register("maxScore", {
                  valueAsNumber: true,
                  required: "Укажите максимальный балл",
                  min: { value: 0, message: "Минимум 0" },
                })}
              />
              {errors.maxScore ? <p className="text-sm text-error">{errors.maxScore.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="practice-difficulty">Сложность</Label>
              <select id="practice-difficulty" className={selectClassName} {...register("difficulty")}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="practice-stack">Стек через запятую</Label>
              <Input id="practice-stack" placeholder="TypeScript, React" {...register("stack")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="practice-time-limit">Лимит времени, мс</Label>
              <Input
                id="practice-time-limit"
                type="number"
                min={1}
                aria-invalid={Boolean(errors.timeLimitMs)}
                {...register("timeLimitMs", { validate: optionalPositiveInteger })}
              />
              {errors.timeLimitMs ? <p className="text-sm text-error">{errors.timeLimitMs.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="practice-memory-limit">Лимит памяти, МБ</Label>
              <Input
                id="practice-memory-limit"
                type="number"
                min={1}
                aria-invalid={Boolean(errors.memoryLimitMb)}
                {...register("memoryLimitMb", { validate: optionalPositiveInteger })}
              />
              {errors.memoryLimitMb ? <p className="text-sm text-error">{errors.memoryLimitMb.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="practice-external-ref">Внешняя ссылка или идентификатор</Label>
            <Input
              id="practice-external-ref"
              aria-invalid={Boolean(errors.externalRef)}
              {...register("externalRef", {
                validate: (value) => value.length <= 300 || "Максимум 300 символов",
              })}
            />
            {errors.externalRef ? <p className="text-sm text-error">{errors.externalRef.message}</p> : null}
          </div>

          {mutationError ? (
            <p className="rounded-md border border-error/35 bg-error/10 p-3 text-sm text-error" role="alert">
              Не удалось сохранить задание. Проверьте данные и уникальность порядка.
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEditing ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
