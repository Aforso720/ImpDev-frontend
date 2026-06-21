"use client"

import * as React from "react"

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

import type { ReviewAssessmentAttemptPayload, ReviewPracticeSubmissionPayload } from "../teacher.types"
import { safeNumber, safeText, selectClassName } from "./teacher-ui"

type ReviewMode = "practice" | "assessment"

export type TeacherReviewTarget = {
  id: string
  title?: string | null
  studentName?: string | null
  maxScore?: number | null
  answerPreview?: string | null
  score?: number | null
  comment?: string | null
}

type PracticeSubmit = (payload: ReviewPracticeSubmissionPayload) => void
type AssessmentSubmit = (payload: ReviewAssessmentAttemptPayload) => void

export function TeacherSubmissionReviewDialog({
  open,
  onOpenChange,
  mode,
  target,
  isPending,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ReviewMode
  target?: TeacherReviewTarget | null
  isPending?: boolean
  onSubmit: PracticeSubmit | AssessmentSubmit
}) {
  const [status, setStatus] = React.useState("APPROVED")
  const [score, setScore] = React.useState("")
  const [comment, setComment] = React.useState("")

  React.useEffect(() => {
    if (!open) return
    setStatus(mode === "practice" ? "APPROVED" : "PASSED")
    setScore(target?.score === null || target?.score === undefined ? "" : String(target.score))
    setComment(target?.comment ?? "")
  }, [mode, open, target?.comment, target?.score])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedComment = comment.trim()
    const parsedScore = score.trim() === "" ? undefined : Number(score)
    const payload = {
      status,
      ...(Number.isFinite(parsedScore) ? { score: parsedScore } : {}),
      ...(trimmedComment ? { comment: trimmedComment } : {}),
    }

    if (mode === "practice") {
      ;(onSubmit as PracticeSubmit)(payload as ReviewPracticeSubmissionPayload)
    } else {
      ;(onSubmit as AssessmentSubmit)(payload as ReviewAssessmentAttemptPayload)
    }
  }

  const maxScore = safeNumber(target?.maxScore)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "practice" ? "Проверка практики" : "Проверка теста"}</DialogTitle>
          <DialogDescription>
            {safeText(target?.studentName, "Студент")} · {safeText(target?.title, "Задание")}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="rounded-md border border-border bg-muted/35 p-3">
            <p className="text-xs font-medium text-muted-foreground">Краткий ответ</p>
            <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap break-words text-sm text-foreground">
              {safeText(target?.answerPreview, "Ответ не передан")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="teacher-review-status">Статус</Label>
              <select
                id="teacher-review-status"
                className={selectClassName}
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                disabled={isPending}
              >
                {mode === "practice" ? (
                  <>
                    <option value="APPROVED">Одобрено</option>
                    <option value="REJECTED">Отклонено</option>
                  </>
                ) : (
                  <>
                    <option value="PASSED">Зачтено</option>
                    <option value="FAILED">Не зачтено</option>
                    <option value="NEEDS_REVISION">На доработку</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher-review-score">Оценка{maxScore > 0 ? ` из ${maxScore}` : ""}</Label>
              <Input
                id="teacher-review-score"
                type="number"
                min={0}
                max={maxScore > 0 ? maxScore : undefined}
                value={score}
                onChange={(event) => setScore(event.target.value)}
                disabled={isPending}
                placeholder="Не обязательно"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher-review-comment">Комментарий</Label>
            <Textarea
              id="teacher-review-comment"
              className="min-h-28 bg-background"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={isPending}
              placeholder="Короткая обратная связь для студента"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Сохраняем..." : "Сохранить проверку"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
