import { useMutation, useQueryClient } from "@tanstack/react-query"

import { adminKeys } from "@/features/admin/hooks/admin.query-keys"
import { teacherKeys } from "@/features/teacher/hooks/teacher.query-keys"

import { CourseService } from "../course.service"
import type { CreateCoursePayload, UpdateCoursePayload } from "../course.types"
import { courseKeys } from "./course.query-keys"

function useInvalidateCourseManagement() {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: courseKeys.lists }),
      queryClient.invalidateQueries({ queryKey: courseKeys.details }),
      queryClient.invalidateQueries({ queryKey: teacherKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminKeys.all }),
    ])
}

export function useCreateCourse() {
  const invalidate = useInvalidateCourseManagement()

  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => CourseService.createCourse(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateCourse() {
  const invalidate = useInvalidateCourseManagement()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCoursePayload }) =>
      CourseService.updateCourse(id, payload),
    onSuccess: invalidate,
  })
}

export function usePublishCourse() {
  const invalidate = useInvalidateCourseManagement()

  return useMutation({
    mutationFn: (id: string) => CourseService.publishCourse(id),
    onSuccess: invalidate,
  })
}

export function useArchiveCourse() {
  const invalidate = useInvalidateCourseManagement()

  return useMutation({
    mutationFn: (id: string) => CourseService.archiveCourse(id),
    onSuccess: invalidate,
  })
}
