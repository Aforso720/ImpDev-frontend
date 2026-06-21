import type {
  AdminCoursesParams,
  AdminTeamsParams,
  AdminUniversitiesParams,
  AdminUniversityMembersParams,
  AdminUsersParams,
} from "../admin.types"

export const adminKeys = {
  all: ["admin"] as const,
  overview: () => [...adminKeys.all, "overview"] as const,
  users: (params: AdminUsersParams) => [...adminKeys.all, "users", params] as const,
  user: (id: string) => [...adminKeys.all, "users", id] as const,
  teams: (params: AdminTeamsParams) => [...adminKeys.all, "teams", params] as const,
  universities: (params: AdminUniversitiesParams) => [...adminKeys.all, "universities", params] as const,
  universityMembers: (universityId: string, params: AdminUniversityMembersParams) =>
    [...adminKeys.all, "universities", universityId, "members", params] as const,
  courses: (params: AdminCoursesParams) => [...adminKeys.all, "courses", params] as const,
}
