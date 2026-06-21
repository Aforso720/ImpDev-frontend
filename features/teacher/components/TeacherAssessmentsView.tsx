"use client"

import * as React from "react"
import { ClipboardList } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

import {
  useReviewAssessmentAttempt,
  useTeacherAssessmentAttempts,
  useTeacherCourses,
} from "../hooks"
import type {
  ReviewAssessmentAttemptPayload,
  TeacherAssessmentAttempt,
  TeacherAssessmentAttemptStatus,
} from "../teacher.types"
import { TeacherAssessmentAttemptsTable } from "./TeacherAssessmentAttemptsTable"
import { TeacherPageHeader } from "./TeacherPageHeader"
import {
  getUserDisplayName,
  safeText,
  selectClassName,
} from "./teacher-ui"
import { TeacherSubmissionReviewDialog, type TeacherReviewTarget } from "./TeacherSubmissionReviewDialog"

const attemptStatuses: Array<{ value: "" | TeacherAssessmentAttemptStatus; label: string }> = [
  { value: "", label: "Все статусы" },
  { value: "SUBMITTED", label: "На проверке" },
  { value: "PASSED", label: "Зачтено" },
  { value: "FAILED", label: "Не зачтено" },
  { value: "NEEDS_REVISION", label: "На доработку" },
  { value: "SCHEDULED", label: "Запланировано" },
]

export function TeacherAssessmentsView() {
  const [courseId, setCourseId] = React.useState("")
  const [status, setStatus] = React.useState<"" | TeacherAssessmentAttemptStatus>("SUBMITTED")
  const [selected, setSelected] = React.useState<TeacherAssessmentAttempt | null>(null)

  const coursesQuery = useTeacherCourses()
  const attemptsQuery = useTeacherAssessmentAttempts({ courseId, status })
  const reviewMutation = useReviewAssessmentAttempt()

  const target: TeacherReviewTarget | null = selected
    ? {
        id: selected.id,
        title: selected.assessment?.title,
        studentName: getUserDisplayName(selected.user),
        maxScore: selected.assessment?.maxScore,
        answerPreview: selected.answerPreview || selected.artifactUrl,
        score: selected.score,
        comment: selected.comment,
      }
    : null

  return (
    <section className="space-y-6">
      <TeacherPageHeader
        title="Проверка тестов"
        description="Простая очередь assessment attempts. Если assessment-модуль пуст, страница останется аккуратно пустой."
      />

      <Card className="border-border bg-card">
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="teacher-assessment-course">Курс</Label>
            <select
              id="teacher-assessment-course"
              className={selectClassName}
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              disabled={coursesQuery.isLoading}
            >
              <option value="">Все курсы</option>
              {(coursesQuery.data ?? []).map((course) => (
                <option key={course.id} value={course.id}>
                  {safeText(course.title, "Без названия")}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher-assessment-status">Статус</Label>
            <select
              id="teacher-assessment-status"
              className={selectClassName}
              value={status}
              onChange={(event) => setStatus(event.target.value as "" | TeacherAssessmentAttemptStatus)}
            >
              {attemptStatuses.map((item) => (
                <option key={item.label} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {coursesQuery.isError ? (
        <Card className="border-warning/35 bg-warning/10">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-warning">
            <ClipboardList className="size-4" />
            Курсы для фильтра не загрузились, но очередь assessment attempts можно открыть без фильтра.
          </CardContent>
        </Card>
      ) : null}

      <TeacherAssessmentAttemptsTable
        attempts={attemptsQuery.data?.items}
        isLoading={attemptsQuery.isLoading}
        isError={attemptsQuery.isError}
        onReview={setSelected}
      />

      <TeacherSubmissionReviewDialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
        mode="assessment"
        target={target}
        isPending={reviewMutation.isPending}
        onSubmit={(payload: ReviewAssessmentAttemptPayload) => {
          if (!selected) return
          reviewMutation.mutate(
            { id: selected.id, payload },
            {
              onSuccess: () => setSelected(null),
            },
          )
        }}
      />
    </section>
  )
}
