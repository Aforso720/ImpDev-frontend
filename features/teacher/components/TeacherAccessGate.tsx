"use client"

import { GraduationCap } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { userService } from "@/lib/services/user.service"

import { useTeacherCourses } from "../hooks"
import { canAccessTeacherPanel } from "../teacher-access"
import { TeacherEmptyState } from "./TeacherEmptyState"

export function TeacherAccessGate({ children }: { children: React.ReactNode }) {
  const userQuery = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => userService.getProfile(),
  })

  const hasDirectTeacherAccess = canAccessTeacherPanel(userQuery.data)
  const shouldCheckManagedCourses = Boolean(userQuery.data && !hasDirectTeacherAccess)
  const coursesQuery = useTeacherCourses({ enabled: shouldCheckManagedCourses })

  if (userQuery.isLoading || (shouldCheckManagedCourses && coursesQuery.isLoading)) {
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

  const hasTeacherAccess = canAccessTeacherPanel(
    userQuery.data,
    (coursesQuery.data?.length ?? 0) > 0,
  )

  if (
    userQuery.isError ||
    (shouldCheckManagedCourses && coursesQuery.isError) ||
    !hasTeacherAccess
  ) {
    return (
      <TeacherEmptyState
        title="Нет доступа к панели преподавателя"
        description="Раздел доступен администратору или пользователю, который может управлять хотя бы одним курсом."
        icon={<GraduationCap />}
      />
    )
  }

  return <>{children}</>
}
