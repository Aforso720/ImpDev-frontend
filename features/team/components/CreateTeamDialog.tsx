"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { TeamApplication } from "@/components/forms/TeamApplication"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { TeamService } from "../team.service"

type TeamFormValues = {
  name: string
  description: string
}

export function CreateTeamDialog({
  trigger,
  mode = "create",
  teamId,
  initialValues,
}: {
  trigger: React.ReactNode
  mode?: "create" | "edit"
  teamId?: string
  initialValues?: Partial<TeamFormValues>
}) {
  const qc = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [showSubmitTrace, setShowSubmitTrace] = React.useState(false)

  const closeTimerRef = React.useRef<number | null>(null)

  const [name, setName] = React.useState(initialValues?.name ?? "")
  const [description, setDescription] = React.useState(initialValues?.description ?? "")

  React.useEffect(() => {
    if (!open) return
    setName(initialValues?.name ?? "")
    setDescription(initialValues?.description ?? "")
    setShowSubmitTrace(false)
  }, [open, initialValues?.name, initialValues?.description])

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  const isEdit = mode === "edit"

  const { mutate, isPending } = useMutation({
    mutationKey: isEdit ? ["team", "update", teamId] : ["team", "create"],
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        description: description.trim(),
      }

      if (!payload.name) {
        throw new Error("Введите название команды")
      }

      if (isEdit) {
        if (!teamId) throw new Error("teamId не передан")
        return TeamService.updateTeam(teamId, payload)
      }

      return TeamService.createTeam(payload)
    },
    onSuccess: async () => {
      setShowSubmitTrace(true)
      toast.success(isEdit ? "Данные команды обновлены" : "Команда отправлена на модерацию")

      await qc.invalidateQueries({ queryKey: ["team", "me"] })
      await qc.invalidateQueries({ queryKey: ["teams", "all"] })

      closeTimerRef.current = window.setTimeout(() => {
        setShowSubmitTrace(false)
        setOpen(false)
      }, 760)
    },
    onError: (e: any) => {
      toast.error(e?.message || "Не удалось выполнить действие")
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setShowSubmitTrace(false)
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактирование команды" : "Создание команды"}</DialogTitle>
          <DialogDescription>
            {isEdit ? (
              <>Измените название и описание команды.</>
            ) : (
              <>После модерации ваша команда станет публичной и появится в поиске.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <TeamApplication
          name={name}
          description={description}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          traceActive={showSubmitTrace}
        />

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={isPending}>
            Отмена
          </Button>
          <Button onClick={() => mutate()} disabled={isPending} firefly>
            {isPending ? "Сохраняем…" : isEdit ? "Сохранить" : "Создать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
