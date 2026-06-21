import { axiosWithAuth } from "@/lib/api/interceptors"

import type {
  ReviewAssessmentAttemptPayload,
  ReviewPracticeSubmissionPayload,
  TeacherAssessmentAttempt,
  TeacherAssessmentAttemptsParams,
  TeacherAssessmentAttemptsResponse,
  TeacherCourse,
  TeacherCourseProgress,
  TeacherCourseStudentsResponse,
  TeacherOverview,
  TeacherPracticeSubmission,
  TeacherPracticeSubmissionsParams,
  TeacherPracticeSubmissionsResponse,
} from "./teacher.types"

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return
    searchParams.set(key, String(value))
  })

  return searchParams.toString()
}

function withQuery(path: string, params: Record<string, string | number | undefined>) {
  const query = buildQuery(params)
  return query ? `${path}?${query}` : path
}

export const TeacherService = {
  async getOverview(): Promise<TeacherOverview> {
    const response = await axiosWithAuth.get<TeacherOverview>("/teacher/overview")
    return response.data
  },

  async getCourses(): Promise<TeacherCourse[]> {
    const response = await axiosWithAuth.get<TeacherCourse[]>("/teacher/courses")
    return response.data
  },

  async getCourseStudents(courseId: string): Promise<TeacherCourseStudentsResponse> {
    const response = await axiosWithAuth.get<TeacherCourseStudentsResponse>(`/teacher/courses/${courseId}/students`)
    return response.data
  },

  async getCourseProgress(courseId: string): Promise<TeacherCourseProgress> {
    const response = await axiosWithAuth.get<TeacherCourseProgress>(`/teacher/courses/${courseId}/progress`)
    return response.data
  },

  async getPracticeSubmissions(
    params: TeacherPracticeSubmissionsParams = {},
  ): Promise<TeacherPracticeSubmissionsResponse> {
    const response = await axiosWithAuth.get<TeacherPracticeSubmissionsResponse>(
      withQuery("/teacher/practice-submissions", {
        courseId: params.courseId,
        status: params.status || undefined,
      }),
    )
    return response.data
  },

  async reviewPracticeSubmission(
    id: string,
    payload: ReviewPracticeSubmissionPayload,
  ): Promise<TeacherPracticeSubmission> {
    const response = await axiosWithAuth.patch<TeacherPracticeSubmission>(
      `/teacher/practice-submissions/${id}/review`,
      payload,
    )
    return response.data
  },

  async getAssessmentAttempts(
    params: TeacherAssessmentAttemptsParams = {},
  ): Promise<TeacherAssessmentAttemptsResponse> {
    const response = await axiosWithAuth.get<TeacherAssessmentAttemptsResponse>(
      withQuery("/teacher/assessment-attempts", {
        courseId: params.courseId,
        status: params.status || undefined,
      }),
    )
    return response.data
  },

  async reviewAssessmentAttempt(
    id: string,
    payload: ReviewAssessmentAttemptPayload,
  ): Promise<TeacherAssessmentAttempt> {
    const response = await axiosWithAuth.patch<TeacherAssessmentAttempt>(
      `/teacher/assessment-attempts/${id}/review`,
      payload,
    )
    return response.data
  },
}
