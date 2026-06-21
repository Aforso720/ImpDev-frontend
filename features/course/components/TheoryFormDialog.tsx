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

import { useCreateTheory, useUpdateTheory } from "../hooks"
import type { CourseTheoryBlock } from "../course.types"

type TheoryFormValues = {
  title: string
  contentMd: string
  order: number
}

export function TheoryFormDialog({
  courseId,
  theory,
  defaultOrder,
  open,
  onOpenChange,
}: {
  courseId: string
  theory?: CourseTheoryBlock | null
  defaultOrder: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createTheory = useCreateTheory()
  const updateTheory = useUpdateTheory()
  const isEditing = Boolean(theory)
  const isPending = createTheory.isPending || updateTheory.isPending
  const mutationError = createTheory.isError || updateTheory.isError
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TheoryFormValues>()

  React.useEffect(() => {
    if (!open) return
    reset({
      title: theory?.title ?? "",
      contentMd: theory?.contentMd ?? "",
      order: theory?.order ?? defaultOrder,
    })
  }, [defaultOrder, open, reset, theory])

  const submit = handleSubmit((payload) => {
    if (theory) {
      updateTheory.mutate(
        { courseId, id: theory.id, payload },
        {
          onSuccess: () => {
            toast.success("Теоретический блок обновлён")
            onOpenChange(false)
          },
          onError: () => toast.error("Не удалось обновить теоретический блок"),
        },
      )
      return
    }

    createTheory.mutate(
      { courseId, payload },
      {
        onSuccess: () => {
          toast.success("Теоретический блок добавлен")
          onOpenChange(false)
        },
        onError: () => toast.error("Не удалось добавить теоретический блок"),
      },
    )
  })

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Редактирование теории" : "Новый теоретический блок"}</DialogTitle>
          <DialogDescription>Markdown-контент и порядок внутри списка теории.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="theory-title">Название</Label>
            <Input
              id="theory-title"
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
            <Label htmlFor="theory-content">Содержание Markdown</Label>
            <Textarea
              id="theory-content"
              className="min-h-56 resize-y"
              aria-invalid={Boolean(errors.contentMd)}
              {...register("contentMd", {
                validate: (value) => {
                  const length = value.trim().length
                  if (length < 1) return "Добавьте содержание"
                  if (length > 50000) return "Максимум 50000 символов"
                  return true
                },
              })}
            />
            {errors.contentMd ? <p className="text-sm text-error">{errors.contentMd.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="theory-order">Порядок</Label>
            <Input
              id="theory-order"
              type="number"
              min={1}
              aria-invalid={Boolean(errors.order)}
              {...register("order", {
                valueAsNumber: true,
                required: "Укажите порядок",
                min: { value: 1, message: "Порядок должен быть не меньше 1" },
              })}
            />
            {errors.order ? <p className="text-sm text-error">{errors.order.message}</p> : null}
          </div>

          {mutationError ? (
            <p className="rounded-md border border-error/35 bg-error/10 p-3 text-sm text-error" role="alert">
              Не удалось сохранить блок. Проверьте данные и уникальность порядка.
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
