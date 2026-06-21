"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { CourseForm } from "@/features/course/components/CourseForm"
import { useCreateCourse } from "@/features/course/hooks"
import type { CreateCoursePayload } from "@/features/course/course.types"

import { TeacherPageHeader } from "./TeacherPageHeader"

export function TeacherCourseCreateView() {
  const router = useRouter()
  const createCourse = useCreateCourse()

  function handleSubmit(payload: CreateCoursePayload) {
    createCourse.mutate(payload, {
      onSuccess: () => {
        toast.success("Курс создан")
        router.push("/teacher/courses")
      },
      onError: () => toast.error("Не удалось создать курс"),
    })
  }

  return (
    <section className="space-y-6">
      <TeacherPageHeader
        title="Создание курса"
        description="Заполните основные данные и настройте область доступа. Новый курс будет создан как черновик."
        actions={
          <Button asChild variant="outline">
            <Link href="/teacher/courses">
              <ArrowLeft className="size-4" />
              К курсам
            </Link>
          </Button>
        }
      />

      <CourseForm
        audience="teacher"
        submitLabel="Создать курс"
        cancelHref="/teacher/courses"
        isSubmitting={createCourse.isPending}
        errorMessage={createCourse.isError ? "Не удалось создать курс. Проверьте данные и права доступа." : undefined}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
