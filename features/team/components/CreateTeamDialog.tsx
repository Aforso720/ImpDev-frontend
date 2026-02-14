"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
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

  const [name, setName] = React.useState(initialValues?.name ?? "")
  const [description, setDescription] = React.useState(initialValues?.description ?? "")

  // когда открываем — подтягиваем актуальные значения (чтобы не было старых)
  React.useEffect(() => {
    if (!open) return
    setName(initialValues?.name ?? "")
    setDescription(initialValues?.description ?? "")
  }, [open, initialValues?.name, initialValues?.description])

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
      toast.success(isEdit ? "Данные команды обновлены" : "Команда отправлена на модерацию")
      setOpen(false)

      // обновляем то, что у тебя на экране
      await qc.invalidateQueries({ queryKey: ["team", "me"] })
      await qc.invalidateQueries({ queryKey: ["teams", "all"] })
    },
    onError: (e: any) => {
      toast.error(e?.message || "Не удалось выполнить действие")
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактирование команды" : "Создание команды"}</DialogTitle>
          <DialogDescription>
            {isEdit ? (
              <>Измените название и описание команды.</>
            ) : (
              <>
                После модерации ваша команда станет публичной и появится в поиске.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Название</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: ImpDev" />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Описание</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Коротко: чем занимаетесь, кого ищете…"
              className="min-h-[110px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={isPending}>
            Отмена
          </Button>
          <Button onClick={() => mutate()} disabled={isPending}>
            {isPending ? "Сохраняем…" : isEdit ? "Сохранить" : "Создать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
