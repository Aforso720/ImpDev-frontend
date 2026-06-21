import { axiosWithAuth } from "@/lib/api/interceptors"

import type { AssessmentQueryParams, PaginatedAssessments } from "./challenges.types"

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return
    searchParams.set(key, String(value))
  })

  return searchParams.toString()
}

export const ChallengesService = {
  async getAssessments(params: AssessmentQueryParams = {}): Promise<PaginatedAssessments> {
    const query = buildQuery({
      page: params.page ?? 1,
      limit: params.limit ?? 12,
      q: params.q?.trim() || undefined,
      courseId: params.courseId,
      kind: params.kind,
      status: params.status,
    })

    const response = await axiosWithAuth.get<PaginatedAssessments>(`/assessment?${query}`)
    return response.data
  },
}

