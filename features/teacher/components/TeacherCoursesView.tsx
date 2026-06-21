"use client"

import Link from "next/link"
import { ClipboardCheck, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useTeacherCourses } from "../hooks"
import { TeacherCoursesTable } from "./TeacherCoursesTable"
import { TeacherPageHeader } from "./TeacherPageHeader"

export function TeacherCoursesView() {
  const coursesQuery = useTeacherCourses()

  return (
    <section className="space-y-6">
      <TeacherPageHeader
        title="Мои курсы"
        description="Курсы, где вы автор, преподаватель или лидер университета. Для администратора показывается общий список."
        actions={
          <>
            <Button asChild>
              <Link href="/teacher/courses/new">
                <Plus className="size-4" />
                Создать курс
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/teacher/submissions">
                <ClipboardCheck className="size-4" />
                К проверке
              </Link>
            </Button>
          </>
        }
      />

      <TeacherCoursesTable
        courses={coursesQuery.data}
        isLoading={coursesQuery.isLoading}
        isError={coursesQuery.isError}
      />
    </section>
  )
}
