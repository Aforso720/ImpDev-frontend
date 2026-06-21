"use client"

import { Archive, Pencil, Send } from "lucide-react"

import { ConfirmDialog } from "@/components/confrim-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { CourseAssessmentListItem } from "../course-assessment.types"

function statusClassName(status: CourseAssessmentListItem["status"]) {
  if (status === "PUBLISHED") return "border-success/35 bg-success/10 text-success"
  if (status === "ARCHIVED") return "border-error/35 bg-error/10 text-error"
  return "border-warning/35 bg-warning/10 text-warning"
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

export function AssessmentItemCard({
  assessment,
  isPublishing,
  isArchiving,
  onEdit,
  onPublish,
  onArchive,
}: {
  assessment: CourseAssessmentListItem
  isPublishing?: boolean
  isArchiving?: boolean
  onEdit: () => void
  onPublish: () => void
  onArchive: () => void
}) {
  return (
    <Card className="border-border bg-card text-card-foreground">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{assessment.kind}</Badge>
              <Badge variant="outline" className={cn(statusClassName(assessment.status))}>
                {assessment.status}
              </Badge>
              <Badge variant="secondary">{assessment.difficulty}</Badge>
            </div>
            <CardTitle className="text-lg">{assessment.title}</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={onEdit}>
              <Pencil className="size-4" />
              Редактировать
            </Button>

            {assessment.status === "DRAFT" ? (
              <ConfirmDialog
                title="Опубликовать assessment?"
                description="Assessment станет доступен участникам опубликованного курса."
                confirmText="Опубликовать"
                confirmVariant="default"
                isLoading={isPublishing}
                trigger={
                  <Button type="button" size="sm">
                    <Send className="size-4" />
                    Опубликовать
                  </Button>
                }
                onConfirm={onPublish}
              />
            ) : null}

            {assessment.status === "PUBLISHED" ? (
              <ConfirmDialog
                title="Архивировать assessment?"
                description="Новые попытки по этому assessment станут недоступны."
                confirmText="Архивировать"
                isLoading={isArchiving}
                trigger={
                  <Button type="button" size="sm" variant="outline">
                    <Archive className="size-4" />
                    Архивировать
                  </Button>
                }
                onConfirm={onArchive}
              />
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
        <p>Создан: {formatDate(assessment.createdAt)}</p>
        <p>Максимальный балл: {assessment.maxScore}</p>
        <p>Попыток: {assessment._count.attempts}</p>
        <p>Дедлайн: {formatDate(assessment.deadlineAt)}</p>
      </CardContent>
    </Card>
  )
}
