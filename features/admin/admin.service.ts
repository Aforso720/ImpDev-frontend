import { axiosWithAuth } from "@/lib/api/interceptors"

import type {
  AdminCourseListItem,
  AdminCoursesParams,
  AdminOverview,
  AdminPaginated,
  AdminSetUserRolePayload,
  AdminSetUserTeamPayload,
  AdminSetUserUniversityPayload,
  AdminSetUserUniversityRolePayload,
  AdminTeamListItem,
  AdminTeamsParams,
  AdminUniversitiesParams,
  AdminUniversityListItem,
  AdminUniversityMember,
  AdminUniversityMembersParams,
  AdminUserDetail,
  AdminUserListItem,
  AdminUsersParams,
} from "./admin.types"

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

export const AdminService = {
  async getOverview(): Promise<AdminOverview> {
    const response = await axiosWithAuth.get<AdminOverview>("/admin/overview")
    return response.data
  },

  async getUsers(params: AdminUsersParams = {}): Promise<AdminPaginated<AdminUserListItem>> {
    const response = await axiosWithAuth.get<AdminPaginated<AdminUserListItem>>(
      withQuery("/admin/users", {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        q: params.q?.trim() || undefined,
        role: params.role || undefined,
      }),
    )
    return response.data
  },

  async getUser(id: string): Promise<AdminUserDetail> {
    const response = await axiosWithAuth.get<AdminUserDetail>(`/admin/users/${id}`)
    return response.data
  },

  async setUserRole(id: string, payload: AdminSetUserRolePayload): Promise<AdminUserListItem> {
    const response = await axiosWithAuth.patch<AdminUserListItem>(`/admin/users/${id}/role`, payload)
    return response.data
  },

  async setUserTeam(id: string, payload: AdminSetUserTeamPayload): Promise<AdminUserListItem> {
    const response = await axiosWithAuth.patch<AdminUserListItem>(`/admin/users/${id}/team`, payload)
    return response.data
  },

  async setUserUniversity(id: string, payload: AdminSetUserUniversityPayload): Promise<AdminUserDetail> {
    const response = await axiosWithAuth.patch<AdminUserDetail>(`/admin/users/${id}/university`, payload)
    return response.data
  },

  async setUserUniversityRole(id: string, payload: AdminSetUserUniversityRolePayload) {
    const response = await axiosWithAuth.patch(`/admin/users/${id}/university-role`, payload)
    return response.data
  },

  async deleteUser(id: string): Promise<unknown> {
    const response = await axiosWithAuth.delete(`/admin/users/${id}`)
    return response.data
  },

  async getTeams(params: AdminTeamsParams = {}): Promise<AdminPaginated<AdminTeamListItem>> {
    const response = await axiosWithAuth.get<AdminPaginated<AdminTeamListItem>>(
      withQuery("/admin/teams", {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        q: params.q?.trim() || undefined,
        status: params.status || undefined,
      }),
    )
    return response.data
  },

  async approveTeam(id: string): Promise<AdminTeamListItem> {
    const response = await axiosWithAuth.patch<AdminTeamListItem>(`/admin/teams/${id}/approve`)
    return response.data
  },

  async rejectTeam(id: string): Promise<AdminTeamListItem> {
    const response = await axiosWithAuth.patch<AdminTeamListItem>(`/admin/teams/${id}/reject`)
    return response.data
  },

  async deleteTeam(id: string): Promise<unknown> {
    const response = await axiosWithAuth.delete(`/admin/teams/${id}`)
    return response.data
  },

  async getUniversities(
    params: AdminUniversitiesParams = {},
  ): Promise<AdminPaginated<AdminUniversityListItem>> {
    const response = await axiosWithAuth.get<AdminPaginated<AdminUniversityListItem>>(
      withQuery("/admin/universities", {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        q: params.q?.trim() || undefined,
      }),
    )
    return response.data
  },

  async getUniversityMembers(
    universityId: string,
    params: AdminUniversityMembersParams = {},
  ): Promise<AdminPaginated<AdminUniversityMember>> {
    const response = await axiosWithAuth.get<AdminPaginated<AdminUniversityMember>>(
      withQuery(`/admin/universities/${universityId}/members`, {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        q: params.q?.trim() || undefined,
        role: params.role || undefined,
        status: params.status || undefined,
      }),
    )
    return response.data
  },

  async getCourses(params: AdminCoursesParams = {}): Promise<AdminPaginated<AdminCourseListItem>> {
    const response = await axiosWithAuth.get<AdminPaginated<AdminCourseListItem>>(
      withQuery("/admin/courses", {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        q: params.q?.trim() || undefined,
        status: params.status || undefined,
        scope: params.scope || undefined,
      }),
    )
    return response.data
  },
}
