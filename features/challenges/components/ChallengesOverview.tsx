"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Award, ClipboardCheck, Clock3, Flag, Target } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { ChallengesService } from "../challenges.service"
import type { AssessmentKind, AssessmentListItem } from "../challenges.types"

type ChallengeCard = {
  id: string
  title: string
  kind: AssessmentKind
  stack: string[]
  level: "easy" | "medium" | "hard"
  deadline: string | null
  status: "scheduled" | "in_progress" | "submitted" | "passed"
  ratingPoints: number
}

const demoCards: ChallengeCard[] = [
  {
    id: "task-react-dashboard",
    title: "React Dashboard Refactor",
    kind: "TASK",
    stack: ["React", "TypeScript", "Tailwind"],
    level: "medium",
    deadline: "2026-04-28T18:00:00.000Z",
    status: "in_progress",
    ratingPoints: 45,
  },
  {
    id: "exam-js-core",
    title: "JavaScript Core Exam",
    kind: "EXAM",
    stack: ["JavaScript", "Algorithms"],
    level: "hard",
    deadline: "2026-05-02T15:00:00.000Z",
    status: "scheduled",
    ratingPoints: 120,
  },
  {
    id: "task-api-validation",
    title: "API Validation Task",
    kind: "TASK",
    stack: ["NestJS", "Prisma"],
    level: "easy",
    deadline: "2026-04-25T20:00:00.000Z",
    status: "submitted",
    ratingPoints: 30,
  },
]

function kindLabel(kind: AssessmentKind) {
  return kind === "EXAM" ? "Экзамен" : "Задача"
}

function levelLabel(level: ChallengeCard["level"]) {
  if (level === "easy") return "easy"
  if (level === "hard") return "hard"
  return "medium"
}

function statusLabel(status: ChallengeCard["status"]) {
  if (status === "scheduled") return "scheduled"
  if (status === "in_progress") return "in progress"
  if (status === "submitted") return "submitted"
  return "passed"
}

function formatDeadline(value: string | null) {
  if (!value) return "without deadline"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "without deadline"

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function toCard(item: AssessmentListItem): ChallengeCard {
  return {
    id: item.id,
    title: item.title,
    kind: item.kind,
    stack: item.stack,
    level: item.difficulty === "EASY" ? "easy" : item.difficulty === "HARD" ? "hard" : "medium",
    deadline: item.deadlineAt,
    status: "scheduled",
    ratingPoints: item.ratingWeight,
  }
}

export function ChallengesOverview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["challenges", "assessments"],
    queryFn: () => ChallengesService.getAssessments({ page: 1, limit: 12, status: "PUBLISHED" }),
  })

  const apiCards = (data?.items ?? []).map(toCard)
  const cards = apiCards.length > 0 ? apiCards : demoCards

  const examsCount = cards.filter((item) => item.kind === "EXAM").length
  const tasksCount = cards.filter((item) => item.kind === "TASK").length
  const totalRating = cards.reduce((sum, item) => sum + item.ratingPoints, 0)

  return (
    <section className="mx-auto w-full max-w-[1240px] space-y-6 pb-8">
      <Card className="border-brand-soft bg-soft-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Задачи и экзамены
          </CardTitle>
          <CardDescription>
            Вкладка для практических задач и контрольных экзаменов с отдельным вкладом в рейтинг.
            {isError ? " Сейчас отображается демо-режим, потому что API недоступен." : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Card className="border-brand-soft bg-white/85">
            <CardContent className="p-4">
              <p className="text-xs text-ink-muted">Задачи</p>
              <p className="mt-2 text-2xl font-semibold text-ink-strong">{tasksCount}</p>
            </CardContent>
          </Card>
          <Card className="border-brand-soft bg-white/85">
            <CardContent className="p-4">
              <p className="text-xs text-ink-muted">Экзамены</p>
              <p className="mt-2 text-2xl font-semibold text-ink-strong">{examsCount}</p>
            </CardContent>
          </Card>
          <Card className="border-brand-soft bg-white/85">
            <CardContent className="p-4">
              <p className="text-xs text-ink-muted">Потенциал рейтинга</p>
              <p className="mt-2 text-2xl font-semibold text-ink-strong">{totalRating}</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {cards.map((item) => (
            <Card key={item.id} className="border-brand-soft bg-white/90">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={item.kind === "EXAM" ? "default" : "outline"}>{kindLabel(item.kind)}</Badge>
                  <Badge variant="secondary">{statusLabel(item.status)}</Badge>
                  <Badge variant="outline">{levelLabel(item.level)}</Badge>
                </div>

                <h3 className="text-lg font-semibold text-ink-strong">{item.title}</h3>

                <div className="flex flex-wrap gap-2">
                  {item.stack.map((tech) => (
                    <Badge key={`${item.id}-${tech}`} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2 text-sm text-ink-soft">
                  <p className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4" />
                    Дедлайн: {formatDeadline(item.deadline)}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    +{item.ratingPoints} к рейтингу при успешном результате
                  </p>
                </div>

                <Button className="w-full" variant="outline" disabled>
                  <ClipboardCheck className="h-4 w-4" />
                  Скоро: открыть задание
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-brand-soft bg-soft-panel">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-soft">
            Следующий шаг: добавить страницу детали задания и отправку попытки через
            `POST /assessment/:id/attempt`.
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/courses">
                <Flag className="h-4 w-4" />К курсам
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/profile">Мой прогресс</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

