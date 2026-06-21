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
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

import {
  useCourseAssessment,
  useCreateAssessment,
  useUpdateAssessment,
} from "../hooks"
import type {
  AssessmentKind,
  CreateAssessmentPayload,
  UpdateAssessmentPayload,
} from "../course-assessment.types"
import type { PracticeDifficulty } from "../course.types"

type AssessmentFormValues = {
  kind: AssessmentKind
  title: string
  descriptionMd: string
  stack: string
  difficulty: PracticeDifficulty
  maxScore: number
  ratingWeight: number
  deadlineAt: string
  attemptsLimit: string
}

const selectClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px]"

function toDateTimeLocal(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function AssessmentFormDialog({
  courseId,
  assessmentId,
  open,
  onOpenChange,
}: {
  courseId: string
  assessmentId?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const assessmentQuery = useCourseAssessment(assessmentId ?? "", open && Boolean(assessmentId))
  const createAssessment = useCreateAssessment()
  const updateAssessment = useUpdateAssessment()
  const isEditing = Boolean(assessmentId)
  const isPending = createAssessment.isPending || updateAssessment.isPending
  const mutationError = createAssessment.isError || updateAssessment.isError
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssessmentFormValues>()

  React.useEffect(() => {
    if (!open) return
    if (assessmentId && !assessmentQuery.data) return

    const assessment = assessmentQuery.data
    reset({
      kind: assessment?.kind ?? "TASK",
      title: assessment?.title ?? "",
      descriptionMd: assessment?.descriptionMd ?? "",
      stack: assessment?.stack?.join(", ") ?? "",
      difficulty: assessment?.difficulty ?? "MEDIUM",
      maxScore: assessment?.maxScore ?? 100,
      ratingWeight: assessment?.ratingWeight ?? 25,
      deadlineAt: toDateTimeLocal(assessment?.deadlineAt),
      attemptsLimit: assessment?.attemptsLimit ? String(assessment.attemptsLimit) : "",
    })
  }, [assessmentId, assessmentQuery.data, open, reset])

  const submit = handleSubmit((values) => {
    const common = {
      kind: values.kind,
      title: values.title.trim(),
      descriptionMd: values.descriptionMd.trim(),
      stack: values.stack.split(",").map((item) => item.trim()).filter(Boolean),
      difficulty: values.difficulty,
      maxScore: values.maxScore,
      ratingWeight: values.ratingWeight,
    }

    if (assessmentId) {
      const payload: UpdateAssessmentPayload = {
        ...common,
        deadlineAt: values.deadlineAt ? new Date(values.deadlineAt).toISOString() : null,
        attemptsLimit: values.attemptsLimit ? Number(values.attemptsLimit) : null,
      }
      updateAssessment.mutate(
        { courseId, id: assessmentId, payload },
        {
          onSuccess: () => {
            toast.success("Assessment обновлён")
            onOpenChange(false)
          },
          onError: () => toast.error("Не удалось обновить assessment"),
        },
      )
      return
    }

    const payload: CreateAssessmentPayload = { courseId, ...common }
    if (values.deadlineAt) payload.deadlineAt = new Date(values.deadlineAt).toISOString()
    if (values.attemptsLimit) payload.attemptsLimit = Number(values.attemptsLimit)

    createAssessment.mutate(payload, {
      onSuccess: () => {
        toast.success("Assessment создан")
        onOpenChange(false)
      },
      onError: () => toast.error("Не удалось создать assessment"),
    })
  })

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Редактирование assessment" : "Новый assessment"}</DialogTitle>
          <DialogDescription>Базовое задание или экзамен без конструктора вопросов.</DialogDescription>
        </DialogHeader>

        {isEditing && assessmentQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isEditing && assessmentQuery.isError ? (
          <p className="rounded-md border border-error/35 bg-error/10 p-3 text-sm text-error" role="alert">
            Не удалось загрузить assessment для редактирования.
          </p>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assessment-kind">Тип</Label>
                <select id="assessment-kind" className={selectClassName} {...register("kind")}>
                  <option value="TASK">Task</option>
                  <option value="EXAM">Exam</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assessment-difficulty">Сложность</Label>
                <select id="assessment-difficulty" className={selectClassName} {...register("difficulty")}>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessment-title">Название</Label>
              <Input
                id="assessment-title"
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
              <Label htmlFor="assessment-description">Описание Markdown</Label>
              <Textarea
                id="assessment-description"
                className="min-h-48 resize-y"
                aria-invalid={Boolean(errors.descriptionMd)}
                {...register("descriptionMd", {
                  validate: (value) => {
                    const length = value.trim().length
                    if (length < 1) return "Добавьте описание"
                    if (length > 50000) return "Максимум 50000 символов"
                    return true
                  },
                })}
              />
              {errors.descriptionMd ? <p className="text-sm text-error">{errors.descriptionMd.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessment-stack">Стек через запятую</Label>
              <Input
                id="assessment-stack"
                placeholder="TypeScript, React"
                aria-invalid={Boolean(errors.stack)}
                {...register("stack", {
                  validate: (value) =>
                    value.split(",").map((item) => item.trim()).filter(Boolean).length <= 20 || "Максимум 20 значений",
                })}
              />
              {errors.stack ? <p className="text-sm text-error">{errors.stack.message}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assessment-max-score">Максимальный балл</Label>
                <Input
                  id="assessment-max-score"
                  type="number"
                  min={1}
                  max={1000}
                  aria-invalid={Boolean(errors.maxScore)}
                  {...register("maxScore", {
                    valueAsNumber: true,
                    required: "Укажите балл",
                    min: { value: 1, message: "Минимум 1" },
                    max: { value: 1000, message: "Максимум 1000" },
                  })}
                />
                {errors.maxScore ? <p className="text-sm text-error">{errors.maxScore.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="assessment-rating-weight">Вес рейтинга</Label>
                <Input
                  id="assessment-rating-weight"
                  type="number"
                  min={0}
                  max={1000}
                  aria-invalid={Boolean(errors.ratingWeight)}
                  {...register("ratingWeight", {
                    valueAsNumber: true,
                    required: "Укажите вес",
                    min: { value: 0, message: "Минимум 0" },
                    max: { value: 1000, message: "Максимум 1000" },
                  })}
                />
                {errors.ratingWeight ? <p className="text-sm text-error">{errors.ratingWeight.message}</p> : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assessment-deadline">Дедлайн</Label>
                <Input id="assessment-deadline" type="datetime-local" {...register("deadlineAt")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assessment-attempts-limit">Лимит попыток</Label>
                <Input
                  id="assessment-attempts-limit"
                  type="number"
                  min={1}
                  max={20}
                  aria-invalid={Boolean(errors.attemptsLimit)}
                  {...register("attemptsLimit", {
                    validate: (value) => {
                      if (!value) return true
                      const number = Number(value)
                      return (Number.isInteger(number) && number >= 1 && number <= 20) || "Допустимо от 1 до 20"
                    },
                  })}
                />
                {errors.attemptsLimit ? <p className="text-sm text-error">{errors.attemptsLimit.message}</p> : null}
              </div>
            </div>

            {mutationError ? (
              <p className="rounded-md border border-error/35 bg-error/10 p-3 text-sm text-error" role="alert">
                Не удалось сохранить assessment. Проверьте введённые данные.
              </p>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {isEditing ? "Сохранить" : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
