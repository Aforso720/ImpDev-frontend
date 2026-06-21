"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { CourseForm } from "@/features/course/components/CourseForm"
import type { CreateCoursePayload } from "@/features/course/course.types"
import { useCreateCourse } from "@/features/course/hooks"

import { AdminPageHeader } from "./AdminPageHeader"

export function AdminCourseCreateView() {
  const router = useRouter()
  const createCourse = useCreateCourse()

  function handleSubmit(payload: CreateCoursePayload) {
    createCourse.mutate(payload, {
      onSuccess: () => {
        toast.success("Курс создан")
        router.push("/admin/courses")
      },
      onError: () => toast.error("Не удалось создать курс"),
    })
  }

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Создание курса"
        description="Создайте черновик курса и настройте его область доступа."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/courses">
              <ArrowLeft className="size-4" />
              К курсам
            </Link>
          </Button>
        }
      />

      <CourseForm
        audience="admin"
        submitLabel="Создать курс"
        cancelHref="/admin/courses"
        isSubmitting={createCourse.isPending}
        errorMessage={createCourse.isError ? "Не удалось создать курс. Проверьте введённые данные." : undefined}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
