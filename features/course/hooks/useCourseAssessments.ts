import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { adminKeys } from "@/features/admin/hooks/admin.query-keys"
import { teacherKeys } from "@/features/teacher/hooks/teacher.query-keys"

import { CourseAssessmentService } from "../course-assessment.service"
import type { CreateAssessmentPayload, UpdateAssessmentPayload } from "../course-assessment.types"
import { courseKeys } from "./course.query-keys"
import { assessmentKeys } from "./assessment.query-keys"

function useInvalidateAssessments() {
  const queryClient = useQueryClient()

  return (courseId: string) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all }),
      queryClient.invalidateQueries({ queryKey: courseKeys.manageable(courseId) }),
      queryClient.invalidateQueries({ queryKey: courseKeys.lists }),
      queryClient.invalidateQueries({ queryKey: teacherKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminKeys.all }),
      queryClient.invalidateQueries({ queryKey: ["challenges"] }),
    ])
}

export function useCourseAssessments(courseId: string, enabled = true) {
  return useQuery({
    queryKey: assessmentKeys.course(courseId),
    queryFn: () => CourseAssessmentService.getCourseAssessments(courseId),
    enabled: enabled && Boolean(courseId),
  })
}

export function useCourseAssessment(assessmentId: string, enabled = true) {
  return useQuery({
    queryKey: assessmentKeys.detail(assessmentId),
    queryFn: () => CourseAssessmentService.getAssessmentById(assessmentId),
    enabled: enabled && Boolean(assessmentId),
  })
}

export function useCreateAssessment() {
  const invalidate = useInvalidateAssessments()

  return useMutation({
    mutationFn: (payload: CreateAssessmentPayload) => CourseAssessmentService.createAssessment(payload),
    onSuccess: (_, variables) => invalidate(variables.courseId),
  })
}

export function useUpdateAssessment() {
  const invalidate = useInvalidateAssessments()

  return useMutation({
    mutationFn: ({ id, payload }: { courseId: string; id: string; payload: UpdateAssessmentPayload }) =>
      CourseAssessmentService.updateAssessment(id, payload),
    onSuccess: (_, variables) => invalidate(variables.courseId),
  })
}

export function usePublishAssessment() {
  const invalidate = useInvalidateAssessments()

  return useMutation({
    mutationFn: ({ id }: { courseId: string; id: string }) => CourseAssessmentService.publishAssessment(id),
    onSuccess: (_, variables) => invalidate(variables.courseId),
  })
}

export function useArchiveAssessment() {
  const invalidate = useInvalidateAssessments()

  return useMutation({
    mutationFn: ({ id }: { courseId: string; id: string }) => CourseAssessmentService.archiveAssessment(id),
    onSuccess: (_, variables) => invalidate(variables.courseId),
  })
}
