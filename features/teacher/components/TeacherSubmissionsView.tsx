"use client"

import * as React from "react"
import { BookOpenCheck } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

import {
  useReviewPracticeSubmission,
  useTeacherCourses,
  useTeacherPracticeSubmissions,
} from "../hooks"
import type {
  ReviewPracticeSubmissionPayload,
  TeacherPracticeSubmission,
  TeacherPracticeSubmissionStatus,
} from "../teacher.types"
import { TeacherPageHeader } from "./TeacherPageHeader"
import { TeacherPracticeSubmissionsTable } from "./TeacherPracticeSubmissionsTable"
import {
  getUserDisplayName,
  safeText,
  selectClassName,
} from "./teacher-ui"
import { TeacherSubmissionReviewDialog, type TeacherReviewTarget } from "./TeacherSubmissionReviewDialog"

const submissionStatuses: Array<{ value: "" | TeacherPracticeSubmissionStatus; label: string }> = [
  { value: "", label: "Все статусы" },
  { value: "SUBMITTED", label: "На проверке" },
  { value: "APPROVED", label: "Одобрено" },
  { value: "REJECTED", label: "Отклонено" },
]

export function TeacherSubmissionsView({ initialCourseId = "" }: { initialCourseId?: string }) {
  const [courseId, setCourseId] = React.useState(initialCourseId)
  const [status, setStatus] = React.useState<"" | TeacherPracticeSubmissionStatus>("SUBMITTED")
  const [selected, setSelected] = React.useState<TeacherPracticeSubmission | null>(null)

  const coursesQuery = useTeacherCourses()
  const submissionsQuery = useTeacherPracticeSubmissions({ courseId, status })
  const reviewMutation = useReviewPracticeSubmission()

  const target: TeacherReviewTarget | null = selected
    ? {
        id: selected.id,
        title: selected.practiceTask?.title,
        studentName: getUserDisplayName(selected.user),
        maxScore: selected.practiceTask?.maxScore,
        answerPreview: selected.answerPreview,
        score: selected.score,
        comment: selected.comment,
      }
    : null

  return (
    <section className="space-y-6">
      <TeacherPageHeader
        title="Проверка практик"
        description="Очередь практических работ с быстрым фильтром по курсу и статусу."
      />

      <Card className="border-border bg-card">
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="teacher-submission-course">Курс</Label>
            <select
              id="teacher-submission-course"
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
            <Label htmlFor="teacher-submission-status">Статус</Label>
            <select
              id="teacher-submission-status"
              className={selectClassName}
              value={status}
              onChange={(event) => setStatus(event.target.value as "" | TeacherPracticeSubmissionStatus)}
            >
              {submissionStatuses.map((item) => (
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
            <BookOpenCheck className="size-4" />
            Курсы для фильтра не загрузились, но очередь проверок можно открыть без фильтра.
          </CardContent>
        </Card>
      ) : null}

      <TeacherPracticeSubmissionsTable
        submissions={submissionsQuery.data?.items}
        isLoading={submissionsQuery.isLoading}
        isError={submissionsQuery.isError}
        onReview={setSelected}
      />

      <TeacherSubmissionReviewDialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
        mode="practice"
        target={target}
        isPending={reviewMutation.isPending}
        onSubmit={(payload: ReviewPracticeSubmissionPayload) => {
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
