"use client"

import { ClipboardList } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getInitials } from "@/lib/getInitials"

import type { TeacherAssessmentAttempt } from "../teacher.types"
import { TeacherEmptyState } from "./TeacherEmptyState"
import {
  formatTeacherDate,
  getUserDisplayName,
  safeNumber,
  safeText,
  TeacherStatusBadge,
} from "./teacher-ui"

export function TeacherAssessmentAttemptsTable({
  attempts,
  isLoading,
  isError,
  onReview,
}: {
  attempts?: TeacherAssessmentAttempt[]
  isLoading?: boolean
  isError?: boolean
  onReview: (attempt: TeacherAssessmentAttempt) => void
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
        title="Не удалось загрузить проверки тестов"
        description="Если модуль assessment недоступен, эта страница останется пустой."
        icon={<ClipboardList />}
      />
    )
  }

  if (!attempts?.length) {
    return (
      <TeacherEmptyState
        title="Очередь тестов пуста"
        description="Отправленные assessment attempts появятся здесь после сдачи студентами."
        icon={<ClipboardList />}
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
              <TableHead>Assessment</TableHead>
              <TableHead>Попытка</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Оценка</TableHead>
              <TableHead>Отправлено</TableHead>
              <TableHead>Ответ</TableHead>
              <TableHead className="pr-5 text-right">Действие</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attempts.map((attempt) => {
              const studentName = getUserDisplayName(attempt.user)
              const maxScore = attempt.assessment?.maxScore

              return (
                <TableRow key={attempt.id}>
                  <TableCell className="pl-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={attempt.user?.avatarUrl ?? undefined} alt={studentName} />
                        <AvatarFallback>{getInitials(studentName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{studentName}</p>
                        <p className="truncate text-xs text-muted-foreground">{attempt.user?.email ?? "email не указан"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-48 truncate">
                    {safeText(attempt.assessment?.course?.title, "Курс не указан")}
                  </TableCell>
                  <TableCell className="max-w-56 truncate">
                    {safeText(attempt.assessment?.title, "Assessment не указан")}
                  </TableCell>
                  <TableCell>{attempt.attemptNo ?? "—"}</TableCell>
                  <TableCell>
                    <TeacherStatusBadge type="attempt" status={attempt.status} />
                  </TableCell>
                  <TableCell>
                    {attempt.score ?? "—"}
                    {typeof maxScore === "number" ? <span className="text-muted-foreground"> / {maxScore}</span> : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatTeacherDate(attempt.submittedAt)}</TableCell>
                  <TableCell className="max-w-xs whitespace-normal">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {safeText(attempt.answerPreview || attempt.artifactUrl, "Ответ не передан")}
                    </p>
                    {safeNumber(attempt.answerTextLength) > 0 ? (
                      <p className="mt-1 text-xs text-muted-foreground">{safeNumber(attempt.answerTextLength)} симв.</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Button size="sm" onClick={() => onReview(attempt)}>
                      <ClipboardList className="size-4" />
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
