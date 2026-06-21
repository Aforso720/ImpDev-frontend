"use client"

import { ClipboardCheck } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getInitials } from "@/lib/getInitials"

import type { TeacherPracticeSubmission } from "../teacher.types"
import { TeacherEmptyState } from "./TeacherEmptyState"
import {
  formatTeacherDate,
  getUserDisplayName,
  safeNumber,
  safeText,
  TeacherStatusBadge,
} from "./teacher-ui"

export function TeacherPracticeSubmissionsTable({
  submissions,
  isLoading,
  isError,
  onReview,
}: {
  submissions?: TeacherPracticeSubmission[]
  isLoading?: boolean
  isError?: boolean
  onReview: (submission: TeacherPracticeSubmission) => void
}) {
  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="space-y-3 p-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <TeacherEmptyState
        title="Не удалось загрузить практики"
        description="Проверьте доступ или попробуйте обновить страницу."
        icon={<ClipboardCheck />}
      />
    )
  }

  if (!submissions?.length) {
    return (
      <TeacherEmptyState
        title="Очередь практик пуста"
        description="Когда студенты отправят практические работы, они появятся здесь."
        icon={<ClipboardCheck />}
      />
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Студент</TableHead>
              <TableHead>Курс</TableHead>
              <TableHead>Задание</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Оценка</TableHead>
              <TableHead>Отправлено</TableHead>
              <TableHead>Ответ</TableHead>
              <TableHead className="pr-5 text-right">Действие</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => {
              const studentName = getUserDisplayName(submission.user)
              const maxScore = submission.practiceTask?.maxScore

              return (
                <TableRow key={submission.id}>
                  <TableCell className="pl-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={submission.user?.avatarUrl ?? undefined} alt={studentName} />
                        <AvatarFallback>{getInitials(studentName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{studentName}</p>
                        <p className="truncate text-xs text-muted-foreground">{submission.user?.email ?? "email не указан"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-48 truncate">
                    {safeText(submission.practiceTask?.course?.title, "Курс не указан")}
                  </TableCell>
                  <TableCell className="max-w-56 truncate">
                    {safeText(submission.practiceTask?.title, "Задание не указано")}
                  </TableCell>
                  <TableCell>
                    <TeacherStatusBadge type="submission" status={submission.status} />
                  </TableCell>
                  <TableCell>
                    {submission.score ?? "—"}
                    {typeof maxScore === "number" ? <span className="text-muted-foreground"> / {maxScore}</span> : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatTeacherDate(submission.createdAt)}</TableCell>
                  <TableCell className="max-w-xs whitespace-normal">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {safeText(submission.answerPreview, "Ответ не передан")}
                    </p>
                    {safeNumber(submission.answerTextLength) > 0 ? (
                      <p className="mt-1 text-xs text-muted-foreground">{safeNumber(submission.answerTextLength)} симв.</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Button size="sm" onClick={() => onReview(submission)}>
                      <ClipboardCheck className="size-4" />
                      Проверить
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
