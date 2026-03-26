import { axiosWithAuth } from "@/lib/api/interceptors"

import type {
  AuthoredCourseItem,
  CourseDetail,
  CourseQueryParams,
  CourseStatus,
  PaginatedCourses,
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
}
