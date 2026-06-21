"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

import { PracticeSubmissionService } from "../practice-submission.service"
import type { PracticeSubmissionStatus } from "../course.types"

type PracticeSubmissionFormProps = {
  taskId: string
}

function statusLabel(status: PracticeSubmissionStatus) {
  if (status === "APPROVED") return "Принято"
  if (status === "REJECTED") return "Нужно доработать"
  return "Отправлено на проверку"
}

function statusVariant(status: PracticeSubmissionStatus): "default" | "secondary" | "outline" {
  if (status === "APPROVED") return "default"
  if (status === "REJECTED") return "outline"
  return "secondary"
}

function parseError(error: unknown) {
  const data = error as { message?: string; response?: { data?: { message?: string | string[] } } }
  if (Array.isArray(data?.response?.data?.message)) return data.response.data.message.join(", ")
  if (typeof data?.response?.data?.message === "string") return data.response.data.message
  if (error instanceof Error) return error.message
  return "Не удалось отправить решение"
}

export function PracticeSubmissionForm({ taskId }: PracticeSubmissionFormProps) {
  const queryClient = useQueryClient()
  const [draftAnswerText, setDraftAnswerText] = useState<string | null>(null)

  const submissionQuery = useQuery({
    queryKey: ["practice-submission", "me", taskId],
    queryFn: () => PracticeSubmissionService.getMySubmission(taskId),
    enabled: Boolean(taskId),
  })

  const submission = submissionQuery.data ?? null
  const answerText = draftAnswerText ?? submission?.answerText ?? ""

  const submitMutation = useMutation({
    mutationFn: () =>
      PracticeSubmissionService.upsertMySubmission(taskId, {
        answerText: answerText.trim(),
      }),
    onSuccess: async () => {
      toast.success("Решение отправлено")
      setDraftAnswerText(null)
      await queryClient.invalidateQueries({ queryKey: ["practice-submission", "me", taskId] })
    },
    onError: (error) => toast.error(parseError(error)),
  })

  const canSubmit = answerText.trim().length > 0 && !submitMutation.isPending

  return (
    <Card className="border-border bg-card text-card-foreground shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">Решение</CardTitle>
            <CardDescription>Отправьте текст ответа или ссылку на артефакт решения.</CardDescription>
          </div>
          {submission ? <Badge variant={statusVariant(submission.status)}>{statusLabel(submission.status)}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={answerText}
          minLength={1}
          maxLength={20_000}
          placeholder="Опишите решение, вставьте код, ссылку на репозиторий или краткий отчет..."
          className="min-h-40 bg-background"
          disabled={submissionQuery.isLoading || submitMutation.isPending}
          onChange={(event) => setDraftAnswerText(event.target.value)}
        />

        {submission ? (
          <div className="space-y-1 rounded-xl border border-border bg-muted/45 p-3 text-sm">
            <p className="text-muted-foreground">
              Последняя отправка: {new Date(submission.updatedAt).toLocaleString("ru-RU")}
            </p>
            {typeof submission.score === "number" ? (
              <p className="text-muted-foreground">Оценка: {submission.score}</p>
            ) : null}
            {submission.comment ? (
              <p className="text-muted-foreground">Комментарий: {submission.comment}</p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" disabled={!canSubmit} onClick={() => submitMutation.mutate()}>
            {submitMutation.isPending ? "Отправляем..." : "Отправить решение"}
          </Button>
          <p className="text-xs text-muted-foreground">
            После отправки можно завершить блок кнопкой «Завершить».
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
