import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { TeacherService } from "../teacher.service"
import type { ReviewAssessmentAttemptPayload } from "../teacher.types"
import { teacherKeys } from "./teacher.query-keys"

export function useReviewAssessmentAttempt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReviewAssessmentAttemptPayload }) =>
      TeacherService.reviewAssessmentAttempt(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      toast.success("Проверка теста сохранена")
    },
    onError: () => {
      toast.error("Не удалось сохранить проверку")
    },
  })
}
