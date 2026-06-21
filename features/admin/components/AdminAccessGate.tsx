"use client"

import { ShieldAlert } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { userService } from "@/lib/services/user.service"

import { AdminEmptyState } from "./AdminEmptyState"

export function AdminAccessGate({ children }: { children: React.ReactNode }) {
  const userQuery = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => userService.getProfile(),
  })

  if (userQuery.isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Card className="border-border bg-card">
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-4/5" />
          </CardContent>
        </Card>
      </section>
    )
  }

  if (userQuery.isError || userQuery.data?.role !== "ADMIN") {
    return (
      <AdminEmptyState
        title="Нет доступа к админ-панели"
        description="Этот раздел доступен только пользователям с глобальной ролью ADMIN."
        icon={<ShieldAlert />}
      />
    )
  }

  return <>{children}</>
}
