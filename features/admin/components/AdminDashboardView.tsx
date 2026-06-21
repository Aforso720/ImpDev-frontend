"use client"

import Link from "next/link"
import { BookOpen, Building2, ShieldCheck, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { useAdminOverview } from "../hooks"
import { AdminOverviewCards } from "./AdminOverviewCards"
import { AdminPageHeader } from "./AdminPageHeader"

const quickLinks = [
  { href: "/admin/users", title: "Пользователи", description: "Роли, команды и университеты.", icon: Users },
  { href: "/admin/teams", title: "Команды", description: "Модерация и состав команд.", icon: ShieldCheck },
  { href: "/admin/universities", title: "Университеты", description: "Участники и статистика.", icon: Building2 },
  { href: "/admin/courses", title: "Курсы", description: "Статусы, авторы и охват.", icon: BookOpen },
]

export function AdminDashboardView() {
  const overviewQuery = useAdminOverview()

  return (
    <section className="space-y-6">
      <AdminPageHeader title="Админ-панель" description="Операционная сводка Bayanum LMS." />

      {overviewQuery.isError ? (
        <Card className="border-error/35 bg-error/10">
          <CardContent className="p-5 text-sm text-error">Не удалось загрузить сводку администратора.</CardContent>
        </Card>
      ) : null}

      <AdminOverviewCards data={overviewQuery.data} isLoading={overviewQuery.isLoading} />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => {
          const Icon = item.icon

          return (
            <Card key={item.href} className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-md border border-border bg-muted text-action">
                    <Icon className="size-4" />
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
