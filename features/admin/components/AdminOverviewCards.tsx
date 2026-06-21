"use client"

import { BookOpen, Building2, ClipboardCheck, GraduationCap, ShieldAlert, Users } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import type { AdminOverview } from "../admin.types"
import { adminSafeNumber } from "./admin-ui"

const overviewCards = [
  { key: "usersTotal", label: "Пользователи", icon: Users },
  { key: "teamsTotal", label: "Команды", icon: ShieldAlert },
  { key: "universitiesTotal", label: "Университеты", icon: Building2 },
  { key: "coursesTotal", label: "Курсы", icon: BookOpen },
  { key: "pendingTeamsTotal", label: "Pending teams", icon: ClipboardCheck },
  { key: "practiceSubmissionsInReview", label: "Submissions", icon: GraduationCap },
] satisfies Array<{ key: keyof AdminOverview; label: string; icon: typeof Users }>

export function AdminOverviewCards({ data, isLoading }: { data?: AdminOverview; isLoading?: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {overviewCards.map((card) => {
        const Icon = card.icon

        return (
          <Card key={card.key} className="border-border bg-card">
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                {isLoading ? (
                  <Skeleton className="mt-3 h-8 w-16" />
                ) : (
                  <p className="mt-2 text-3xl font-semibold text-foreground">{adminSafeNumber(data?.[card.key])}</p>
                )}
              </div>
              <div className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-muted text-action">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
