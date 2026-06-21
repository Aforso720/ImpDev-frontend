import { axiosWithAuth } from "@/lib/api/interceptors"

import type {
  CourseAssessment,
  CourseAssessmentDetail,
  CourseAssessmentListItem,
  CourseAssessmentsPage,
  CreateAssessmentPayload,
  UpdateAssessmentPayload,
} from "./course-assessment.types"

const PAGE_SIZE = 100

export const CourseAssessmentService = {
  async getCourseAssessments(courseId: string): Promise<CourseAssessmentListItem[]> {
    const items: CourseAssessmentListItem[] = []
    let page = 1
    let total = 0

    do {
      const response = await axiosWithAuth.get<CourseAssessmentsPage>("/assessment", {
        params: { courseId, page, limit: PAGE_SIZE },
      })
      items.push(...response.data.items)
      total = response.data.total
      page += 1
    } while (items.length < total)

    return items
  },

  async getAssessmentById(id: string): Promise<CourseAssessmentDetail> {
    const response = await axiosWithAuth.get<CourseAssessmentDetail>(`/assessment/${id}`)
    return response.data
  },

  async createAssessment(payload: CreateAssessmentPayload): Promise<CourseAssessment> {
    const response = await axiosWithAuth.post<CourseAssessment>("/assessment", payload)
    return response.data
  },

  async updateAssessment(id: string, payload: UpdateAssessmentPayload): Promise<CourseAssessment> {
    const response = await axiosWithAuth.patch<CourseAssessment>(`/assessment/${id}`, payload)
    return response.data
  },

  async publishAssessment(id: string): Promise<CourseAssessment> {
    const response = await axiosWithAuth.patch<CourseAssessment>(`/assessment/${id}/publish`)
    return response.data
  },

  async archiveAssessment(id: string): Promise<CourseAssessment> {
    const response = await axiosWithAuth.patch<CourseAssessment>(`/assessment/${id}/archive`)
    return response.data
  },
}
