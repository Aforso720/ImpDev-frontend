import { axiosWithAuth } from "@/lib/api/interceptors"

import type {
  AuthoredCourseItem,
  Course,
  CoursePracticeTask,
  CourseTheoryBlock,
  CreatePracticeTaskPayload,
  CreateCoursePayload,
  CreateTheoryPayload,
  CourseDetail,
  CourseEnrollment,
  CourseQueryParams,
  CourseStatus,
  ManageableCourse,
  PaginatedCourses,
  UpdateCoursePayload,
  UpdatePracticeTaskPayload,
  UpdateTheoryPayload,
} from "./course.types"

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return
    searchParams.set(key, String(value))
  })

  return searchParams.toString()
}

export const CourseService = {
  async createCourse(payload: CreateCoursePayload): Promise<Course> {
    const response = await axiosWithAuth.post<Course>("/course", payload)
    return response.data
  },

  async updateCourse(id: string, payload: UpdateCoursePayload): Promise<Course> {
    const response = await axiosWithAuth.patch<Course>(`/course/${id}`, payload)
    return response.data
  },

  async publishCourse(id: string): Promise<Course> {
    const response = await axiosWithAuth.patch<Course>(`/course/${id}/publish`)
    return response.data
  },

  async archiveCourse(id: string): Promise<Course> {
    const response = await axiosWithAuth.patch<Course>(`/course/${id}/archive`)
    return response.data
  },

  async getManageableCourseById(id: string): Promise<ManageableCourse> {
    const response = await axiosWithAuth.get<ManageableCourse>(`/course/manage/${id}`)
    return response.data
  },

  async getManageableCourseContent(id: string): Promise<CourseDetail> {
    const course = await this.getManageableCourseById(id)
    return this.getBySlug(course.slug)
  },

  async createTheory(courseId: string, payload: CreateTheoryPayload): Promise<CourseTheoryBlock> {
    const response = await axiosWithAuth.post<CourseTheoryBlock>(`/course/${courseId}/theory`, payload)
    return response.data
  },

  async updateTheory(id: string, payload: UpdateTheoryPayload): Promise<CourseTheoryBlock> {
    const response = await axiosWithAuth.patch<CourseTheoryBlock>(`/course/theory/${id}`, payload)
    return response.data
  },

  async deleteTheory(id: string): Promise<CourseTheoryBlock> {
    const response = await axiosWithAuth.delete<CourseTheoryBlock>(`/course/theory/${id}`)
    return response.data
  },

  async createPracticeTask(
    courseId: string,
    payload: CreatePracticeTaskPayload,
  ): Promise<CoursePracticeTask> {
    const response = await axiosWithAuth.post<CoursePracticeTask>(`/course/${courseId}/practice-task`, payload)
    return response.data
  },

  async updatePracticeTask(id: string, payload: UpdatePracticeTaskPayload): Promise<CoursePracticeTask> {
    const response = await axiosWithAuth.patch<CoursePracticeTask>(`/course/practice-task/${id}`, payload)
    return response.data
  },

  async deletePracticeTask(id: string): Promise<CoursePracticeTask> {
    const response = await axiosWithAuth.delete<CoursePracticeTask>(`/course/practice-task/${id}`)
    return response.data
  },

  async getAvailable(params: CourseQueryParams = {}): Promise<PaginatedCourses> {
    const query = buildQuery({
      page: params.page ?? 1,
      limit: params.limit ?? 9,
      q: params.q?.trim() || undefined,
      scope: params.scope && params.scope !== "ALL" ? params.scope : undefined,
    })

    const response = await axiosWithAuth.get<PaginatedCourses>(`/course?${query}`)
    return response.data
  },

  async getAllPublCourse(page = 1, limit = 20): Promise<PaginatedCourses> {
    return this.getAvailable({ page, limit, scope: "PUBLIC" })
  },

  async getMyAuthored(status?: CourseStatus): Promise<AuthoredCourseItem[]> {
    const query = buildQuery({ status })
    const url = query ? `/course/my/authored?${query}` : "/course/my/authored"
    const response = await axiosWithAuth.get<AuthoredCourseItem[]>(url)
    return response.data
  },

  async getBySlug(slug: string): Promise<CourseDetail> {
    const response = await axiosWithAuth.get<CourseDetail>(`/course/${slug}`)
    return response.data
  },

  async enroll(courseId: string): Promise<CourseEnrollment> {
    const response = await axiosWithAuth.post<CourseEnrollment>(`/course/${courseId}/enroll`)
    return response.data
  },

  async complete(courseId: string): Promise<CourseEnrollment> {
    const response = await axiosWithAuth.patch<CourseEnrollment>(`/course/${courseId}/complete`)
    return response.data
  },
}
