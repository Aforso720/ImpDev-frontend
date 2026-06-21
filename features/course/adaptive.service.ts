import { axiosWithAuth } from "@/lib/api/interceptors"
import type {
  AdaptiveCourseState,
  AdaptiveEnrollmentView,
  AdaptivePlanView,
  AdaptivePlansResponse,
  GeneratePlanRequest,
  IntakeRequest,
  ProgressEventRequest,
  RecoveryStartRequest,
  ReplanRequest,
} from "./adaptive.types"

export const AdaptiveService = {
  async getCourseStates(courseIds: string[]): Promise<AdaptiveCourseState[]> {
    if (courseIds.length === 0) return []
    const response = await axiosWithAuth.post<AdaptiveCourseState[]>("/adaptive/courses/state", {
      courseIds,
    })
    return response.data
  },

  async intake(courseEnrollmentId: string, payload: IntakeRequest): Promise<AdaptiveEnrollmentView> {
    const response = await axiosWithAuth.post<AdaptiveEnrollmentView>(
      `/adaptive/enrollments/${courseEnrollmentId}/intake`,
      payload,
    )
    return response.data
  },

  async generatePlan(payload: GeneratePlanRequest): Promise<AdaptivePlanView> {
    const response = await axiosWithAuth.post<AdaptivePlanView>("/adaptive/planner/generate", payload)
    return response.data
  },

  async replan(payload: ReplanRequest): Promise<AdaptivePlanView> {
    const response = await axiosWithAuth.post<AdaptivePlanView>("/adaptive/planner/replan", payload)
    return response.data
  },

  async createProgressEvent(payload: ProgressEventRequest): Promise<{
    id: string
    adaptiveEnrollmentId: string
    eventType: string
    blockId: string | null
    planItemId: string | null
    workflowStageInstanceId: string | null
    occurredAt: string
    createdAt: string
  }> {
    const response = await axiosWithAuth.post("/adaptive/progress/events", payload)
    return response.data
  },

  async getPlans(
    adaptiveEnrollmentId: string,
    params: { scope?: "DAY" | "WEEK"; date?: string; currentOnly?: boolean } = {},
  ): Promise<AdaptivePlansResponse> {
    const query = new URLSearchParams()
    if (params.scope) query.set("scope", params.scope)
    if (params.date) query.set("date", params.date)
    if (typeof params.currentOnly === "boolean") {
      query.set("currentOnly", String(params.currentOnly))
    }

    const suffix = query.toString() ? `?${query.toString()}` : ""
    const response = await axiosWithAuth.get<AdaptivePlansResponse>(
      `/adaptive/enrollments/${adaptiveEnrollmentId}/plans${suffix}`,
    )
    return response.data
  },

  async startRecovery(
    adaptiveEnrollmentId: string,
    payload: RecoveryStartRequest,
  ): Promise<{
    id: string
    adaptiveEnrollmentId: string
    state: "OPEN" | "STABILIZING" | "CLOSED"
    triggerReason: string
    debtMinutes: number
    openedAt: string
    closedAt: string | null
  }> {
    const response = await axiosWithAuth.post(
      `/adaptive/recovery/${adaptiveEnrollmentId}/start`,
      payload,
    )
    return response.data
  },
}
