import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { adminKeys } from "@/features/admin/hooks/admin.query-keys"
import { teacherKeys } from "@/features/teacher/hooks/teacher.query-keys"

import { CourseService } from "../course.service"
import type {
  CreatePracticeTaskPayload,
  CreateTheoryPayload,
  UpdatePracticeTaskPayload,
  UpdateTheoryPayload,
} from "../course.types"
import { courseKeys } from "./course.query-keys"

function useInvalidateCourseContent() {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: courseKeys.details }),
      queryClient.invalidateQueries({ queryKey: courseKeys.lists }),
      queryClient.invalidateQueries({ queryKey: teacherKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminKeys.all }),
    ])
}

export function useManageableCourseContent(courseId: string) {
  return useQuery({
    queryKey: courseKeys.content(courseId),
    queryFn: () => CourseService.getManageableCourseContent(courseId),
    enabled: Boolean(courseId),
  })
}

export function useCreateTheory() {
  const invalidate = useInvalidateCourseContent()

  return useMutation({
    mutationFn: ({ courseId, payload }: { courseId: string; payload: CreateTheoryPayload }) =>
      CourseService.createTheory(courseId, payload),
    onSuccess: invalidate,
  })
}

export function useUpdateTheory() {
  const invalidate = useInvalidateCourseContent()

  return useMutation({
    mutationFn: ({ id, payload }: { courseId: string; id: string; payload: UpdateTheoryPayload }) =>
      CourseService.updateTheory(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteTheory() {
  const invalidate = useInvalidateCourseContent()

  return useMutation({
    mutationFn: ({ id }: { courseId: string; id: string }) => CourseService.deleteTheory(id),
    onSuccess: invalidate,
  })
}

export function useCreatePracticeTask() {
  const invalidate = useInvalidateCourseContent()

  return useMutation({
    mutationFn: ({ courseId, payload }: { courseId: string; payload: CreatePracticeTaskPayload }) =>
      CourseService.createPracticeTask(courseId, payload),
    onSuccess: invalidate,
  })
}

export function useUpdatePracticeTask() {
  const invalidate = useInvalidateCourseContent()

  return useMutation({
    mutationFn: ({ id, payload }: { courseId: string; id: string; payload: UpdatePracticeTaskPayload }) =>
      CourseService.updatePracticeTask(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeletePracticeTask() {
  const invalidate = useInvalidateCourseContent()

  return useMutation({
    mutationFn: ({ id }: { courseId: string; id: string }) => CourseService.deletePracticeTask(id),
    onSuccess: invalidate,
  })
}
