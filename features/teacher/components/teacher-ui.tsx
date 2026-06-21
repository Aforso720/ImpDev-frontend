"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type {
  TeacherAssessmentAttemptStatus,
  TeacherCourseStatus,
  TeacherEnrollmentStatus,
  TeacherPracticeSubmissionStatus,
} from "../teacher.types"

export const selectClassName =
  "h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"

export function safeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

export function safeText(value: string | null | undefined, fallback = "—") {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

export function formatTeacherDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function getUserDisplayName(user?: { name?: string | null; email?: string | null } | null) {
  return safeText(user?.name || user?.email, "Без имени")
}

const courseStatusLabels: Record<TeacherCourseStatus, string> = {
  DRAFT: "Черновик",
  PUBLISHED: "Опубликован",
  ARCHIVED: "Архив",
}

const enrollmentStatusLabels: Record<TeacherEnrollmentStatus, string> = {
  ENROLLED: "Учится",
  COMPLETED: "Завершил",
}

const submissionStatusLabels: Record<TeacherPracticeSubmissionStatus, string> = {
  SUBMITTED: "На проверке",
  APPROVED: "Одобрено",
  REJECTED: "Отклонено",
}

const attemptStatusLabels: Record<TeacherAssessmentAttemptStatus, string> = {
  SCHEDULED: "Запланировано",
  SUBMITTED: "На проверке",
  PASSED: "Зачтено",
  FAILED: "Не зачтено",
  NEEDS_REVISION: "На доработку",
}

function statusClassName(status?: string | null) {
  if (status === "APPROVED" || status === "PASSED" || status === "COMPLETED" || status === "PUBLISHED") {
    return "border-success/35 bg-success/10 text-success"
  }

  if (status === "SUBMITTED" || status === "SCHEDULED" || status === "ENROLLED" || status === "DRAFT") {
    return "border-warning/35 bg-warning/10 text-warning"
  }

  if (status === "REJECTED" || status === "FAILED" || status === "NEEDS_REVISION" || status === "ARCHIVED") {
    return "border-error/35 bg-error/10 text-error"
  }

  return "border-border bg-muted/40 text-muted-foreground"
}

export function TeacherStatusBadge({
  status,
  type,
  className,
}: {
  status?: string | null
  type: "course" | "enrollment" | "submission" | "attempt"
  className?: string
}) {
  let label = status ?? "—"

  if (type === "course" && status && status in courseStatusLabels) {
    label = courseStatusLabels[status as TeacherCourseStatus]
  }
  if (type === "enrollment" && status && status in enrollmentStatusLabels) {
    label = enrollmentStatusLabels[status as TeacherEnrollmentStatus]
  }
  if (type === "submission" && status && status in submissionStatusLabels) {
    label = submissionStatusLabels[status as TeacherPracticeSubmissionStatus]
  }
  if (type === "attempt" && status && status in attemptStatusLabels) {
    label = attemptStatusLabels[status as TeacherAssessmentAttemptStatus]
  }

  return (
    <Badge variant="outline" className={cn(statusClassName(status), className)}>
      {label}
    </Badge>
  )
}
