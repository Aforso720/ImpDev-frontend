"use client"

import { Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getInitials } from "@/lib/getInitials"

import type { TeacherStudentProgress } from "../teacher.types"
import { TeacherEmptyState } from "./TeacherEmptyState"
import { formatTeacherDate, getUserDisplayName, safeNumber, TeacherStatusBadge } from "./teacher-ui"

export function TeacherCourseStudentsTable({
  students,
  isLoading,
  isError,
}: {
  students?: TeacherStudentProgress[]
  isLoading?: boolean
  isError?: boolean
}) {
  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="space-y-3 p-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <TeacherEmptyState
        title="Не удалось загрузить студентов"
        description="Проверьте доступ к курсу и повторите попытку."
        icon={<Users />}
      />
    )
  }

  if (!students?.length) {
    return (
      <TeacherEmptyState
        title="На курс пока никто не записан"
        description="Студенты появятся здесь после записи на курс."
        icon={<Users />}
      />
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Студент</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Прогресс</TableHead>
              <TableHead>Практики</TableHead>
              <TableHead>Тесты</TableHead>
              <TableHead>Записан</TableHead>
              <TableHead className="pr-5">Активность</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const displayName = getUserDisplayName(student.user)
              const progress = safeNumber(student.progressPercent)

              return (
                <TableRow key={student.enrollmentId}>
                  <TableCell className="pl-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={student.user.avatarUrl ?? undefined} alt={displayName} />
                        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{displayName}</p>
                        <p className="truncate text-xs text-muted-foreground">{student.user.email ?? "email не указан"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TeacherStatusBadge type="enrollment" status={student.status} />
                  </TableCell>
                  <TableCell>
                    <div className="min-w-28">
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{progress}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-success" style={{ width: `${Math.min(100, progress)}%` }} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{safeNumber(student.approvedPracticeTasks)}</TableCell>
                  <TableCell>{safeNumber(student.passedAssessments)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatTeacherDate(student.enrolledAt)}</TableCell>
                  <TableCell className="pr-5 text-muted-foreground">{formatTeacherDate(student.lastActivityAt)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
