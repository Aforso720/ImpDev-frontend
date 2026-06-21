"use client"

import { Activity, CheckCircle2, Gauge, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import type { TeacherCourseProgress } from "../teacher.types"
import { safeNumber } from "./teacher-ui"

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: typeof Users
}) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-action" />
      </div>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

export function TeacherCourseProgressPanel({
  progress,
  isLoading,
  isError,
}: {
  progress?: TeacherCourseProgress
  isLoading?: boolean
  isError?: boolean
}) {
  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="border-error/35 bg-error/10">
        <CardContent className="p-5 text-sm text-error">Не удалось загрузить прогресс курса.</CardContent>
      </Card>
    )
  }

  const average = safeNumber(progress?.averageProgress)

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Прогресс курса</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Всего студентов" value={safeNumber(progress?.totalStudents)} icon={Users} />
          <Metric label="Начали" value={safeNumber(progress?.startedStudents)} icon={Activity} />
          <Metric label="Завершили" value={safeNumber(progress?.completedStudents)} icon={CheckCircle2} />
          <Metric label="Средний прогресс" value={`${average}%`} icon={Gauge} />
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${Math.min(100, average)}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">
          Учитываются одобренные практики и зачтенные assessment attempts. Элементов для подсчета:{" "}
          {safeNumber(progress?.measurableItems?.total)}.
        </p>
      </CardContent>
    </Card>
  )
}
