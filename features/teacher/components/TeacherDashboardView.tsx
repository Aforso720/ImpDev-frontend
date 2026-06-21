"use client"

import Link from "next/link"
import { BookOpenCheck, ClipboardCheck, ClipboardList } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { useTeacherOverview } from "../hooks"
import { TeacherOverviewCards } from "./TeacherOverviewCards"
import { TeacherPageHeader } from "./TeacherPageHeader"

const quickLinks = [
  {
    href: "/teacher/courses",
    title: "Мои курсы",
    description: "Студенты, прогресс и активность по каждому курсу.",
    icon: BookOpenCheck,
  },
  {
    href: "/teacher/submissions",
    title: "Проверка практик",
    description: "Очередь практических работ с фильтрами по курсу и статусу.",
    icon: ClipboardCheck,
  },
  {
    href: "/teacher/assessments",
    title: "Проверка тестов",
    description: "Assessment attempts, которые требуют решения преподавателя.",
    icon: ClipboardList,
  },
]

export function TeacherDashboardView() {
  const overviewQuery = useTeacherOverview()

  return (
    <section className="space-y-6">
      <TeacherPageHeader
        title="Панель преподавателя"
        description="Краткая рабочая сводка по курсам, студентам и проверкам."
      />

      {overviewQuery.isError ? (
        <Card className="border-error/35 bg-error/10">
          <CardContent className="p-5 text-sm text-error">
            Не удалось загрузить сводку. Проверьте авторизацию и доступ преподавателя.
          </CardContent>
        </Card>
      ) : null}

      <TeacherOverviewCards data={overviewQuery.data} isLoading={overviewQuery.isLoading} />

      <div className="grid gap-3 lg:grid-cols-3">
        {quickLinks.map((item) => {
          const Icon = item.icon

          return (
            <Card key={item.href} className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-md border border-border bg-nuri-accent/15 text-action">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={item.href}>Открыть</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
