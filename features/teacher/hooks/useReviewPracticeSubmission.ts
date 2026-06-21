import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { TeacherService } from "../teacher.service"
import type { ReviewPracticeSubmissionPayload } from "../teacher.types"
import { teacherKeys } from "./teacher.query-keys"

export function useReviewPracticeSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReviewPracticeSubmissionPayload }) =>
      TeacherService.reviewPracticeSubmission(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      toast.success("Практическая работа проверена")
    },
    onError: () => {
      toast.error("Не удалось сохранить проверку")
    },
  })
}
