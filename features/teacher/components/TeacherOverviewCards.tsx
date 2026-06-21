"use client"

import { BookOpenCheck, ClipboardCheck, GraduationCap, Users } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import type { TeacherOverview } from "../teacher.types"
import { safeNumber } from "./teacher-ui"

const cards = [
  {
    key: "coursesTotal",
    label: "Курсов",
    hint: "доступно для управления",
    icon: BookOpenCheck,
  },
  {
    key: "studentsTotal",
    label: "Студентов",
    hint: "на ваших курсах",
    icon: Users,
  },
  {
    key: "practiceSubmissionsInReview",
    label: "Практик",
    hint: "ожидают проверки",
    icon: ClipboardCheck,
  },
  {
    key: "assessmentAttemptsInReview",
    label: "Тестов",
    hint: "ожидают проверки",
    icon: GraduationCap,
  },
] satisfies Array<{
  key: keyof TeacherOverview
  label: string
  hint: string
  icon: typeof BookOpenCheck
}>

export function TeacherOverviewCards({
  data,
  isLoading,
}: {
  data?: TeacherOverview
  isLoading?: boolean
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.key} className="border-border bg-card">
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                {isLoading ? (
                  <Skeleton className="mt-3 h-8 w-16" />
                ) : (
                  <p className="mt-2 text-3xl font-semibold text-foreground">{safeNumber(data?.[card.key])}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
              </div>
              <div className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-nuri-accent/15 text-action">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
