"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type {
  AdminCourseScope,
  AdminCourseStatus,
  AdminEnrollmentStatus,
  AdminMembershipStatus,
  AdminRole,
  AdminState,
  AdminUniversityRole,
  AdminUniversityStatus,
} from "../admin.types"

export const adminSelectClassName =
  "h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"

export function adminSafeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

export function adminSafeText(value: string | null | undefined, fallback = "—") {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

export function adminUserName(user?: { name?: string | null; email?: string | null } | null) {
  return adminSafeText(user?.name || user?.email, "Без имени")
}

export function adminFormatDate(value?: string | null) {
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

const labels: Record<string, string> = {
  USER: "User",
  ADMIN: "Admin",
  PENDING: "Ожидает",
  APPROVED: "Одобрено",
  REJECTED: "Отклонено",
  DRAFT: "Черновик",
  PUBLISHED: "Опубликован",
  ARCHIVED: "Архив",
  PUBLIC: "Публичный",
  UNIVERSITY: "Университет",
  TEAM: "Команда",
  ACTIVE: "Активен",
  SUSPENDED: "Приостановлен",
  BLOCKED: "Заблокирован",
  LEADER: "Leader",
  INSTRUCTOR: "Instructor",
  STUDENT: "Student",
  ENROLLED: "Учится",
  COMPLETED: "Завершил",
}

function statusClassName(status?: string | null) {
  if (
    status === "APPROVED" ||
    status === "PUBLISHED" ||
    status === "ACTIVE" ||
    status === "COMPLETED" ||
    status === "ADMIN"
  ) {
    return "border-success/35 bg-success/10 text-success"
  }

  if (
    status === "PENDING" ||
    status === "DRAFT" ||
    status === "ENROLLED" ||
    status === "USER" ||
    status === "STUDENT" ||
    status === "INSTRUCTOR"
  ) {
    return "border-warning/35 bg-warning/10 text-warning"
  }

  if (status === "REJECTED" || status === "ARCHIVED" || status === "SUSPENDED" || status === "BLOCKED") {
    return "border-error/35 bg-error/10 text-error"
  }

  if (status === "LEADER") {
    return "border-action/35 bg-action/10 text-action"
  }

  return "border-border bg-muted/40 text-muted-foreground"
}

export function AdminStatusBadge({
  value,
  className,
}: {
  value?:
    | AdminRole
    | AdminState
    | AdminCourseStatus
    | AdminCourseScope
    | AdminUniversityStatus
    | AdminUniversityRole
    | AdminMembershipStatus
    | AdminEnrollmentStatus
    | string
    | null
  className?: string
}) {
  const label = value ? labels[value] ?? value : "—"

  return (
    <Badge variant="outline" className={cn(statusClassName(value), className)}>
      {label}
    </Badge>
  )
}
