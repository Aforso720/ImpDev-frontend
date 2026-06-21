import { axiosWithAuth } from "@/lib/api/interceptors"

import type { PracticeSubmission, UpsertPracticeSubmissionRequest } from "./course.types"

export const PracticeSubmissionService = {
  async getMySubmission(taskId: string): Promise<PracticeSubmission | null> {
    const response = await axiosWithAuth.get<PracticeSubmission | null>(`/practice-task/${taskId}/submission/me`)
    return response.data
  },

  async upsertMySubmission(
    taskId: string,
    payload: UpsertPracticeSubmissionRequest,
  ): Promise<PracticeSubmission> {
    const response = await axiosWithAuth.put<PracticeSubmission>(`/practice-task/${taskId}/submission`, payload)
    return response.data
  },
}
