"use client"

import { Pencil, Trash2 } from "lucide-react"

import { ConfirmDialog } from "@/components/confrim-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CourseContentItemCard({
  kind,
  title,
  order,
  preview,
  metadata,
  isDeleting,
  onEdit,
  onDelete,
}: {
  kind: string
  title: string
  order: number
  preview: string
  metadata?: string
  isDeleting?: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card className="border-border bg-card text-card-foreground">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{kind}</Badge>
              <Badge variant="secondary">Порядок: {order}</Badge>
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={onEdit}>
              <Pencil className="size-4" />
              Редактировать
            </Button>
            <ConfirmDialog
              title={`Удалить «${title}»?`}
              description="Это действие нельзя отменить."
              confirmText="Удалить"
              isLoading={isDeleting}
              trigger={
                <Button type="button" size="sm" variant="destructive">
                  <Trash2 className="size-4" />
                  Удалить
                </Button>
              }
              onConfirm={onDelete}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
          {preview || "Содержимое не заполнено"}
        </p>
        {metadata ? <p className="text-xs text-muted-foreground">{metadata}</p> : null}
      </CardContent>
    </Card>
  )
}
