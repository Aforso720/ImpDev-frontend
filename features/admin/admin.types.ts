export type AdminRole = "USER" | "ADMIN"
export type AdminState = "PENDING" | "APPROVED" | "REJECTED"
export type AdminCourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"
export type AdminCourseScope = "PUBLIC" | "UNIVERSITY" | "TEAM"
export type AdminUniversityStatus = "ACTIVE" | "SUSPENDED"
export type AdminUniversityRole = "LEADER" | "INSTRUCTOR" | "STUDENT"
export type AdminMembershipStatus = "ACTIVE" | "BLOCKED"
export type AdminEnrollmentStatus = "ENROLLED" | "COMPLETED"

export type AdminPageParams = {
  page?: number
  limit?: number
  q?: string
}

export type AdminPaginated<T> = {
  page?: number
  limit?: number
  total?: number
  items?: T[]
}

export type AdminUserLite = {
  id: string
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  role?: AdminRole | string
}

export type AdminTeamLite = {
  id: string
  name?: string | null
  status?: AdminState | string
  avatarUrl?: string | null
}

export type AdminUniversityLite = {
  id: string
  name?: string | null
  slug?: string | null
  shortName?: string | null
  status?: AdminUniversityStatus | string
}

export type AdminOverview = {
  usersTotal?: number
  teamsTotal?: number
  universitiesTotal?: number
  coursesTotal?: number
  pendingTeamsTotal?: number
  pendingTeamJoinRequestsTotal?: number
  practiceSubmissionsInReview?: number
  assessmentAttemptsInReview?: number
}

export type AdminUsersParams = AdminPageParams & {
  role?: AdminRole | ""
}

export type AdminUserListItem = AdminUserLite & {
  createdAt?: string
  updatedAt?: string
  teamId?: string | null
  team?: AdminTeamLite | null
  university?: AdminUniversityLite | null
  universityMemberships?: Array<{
    id?: string
    createdAt?: string
    updatedAt?: string
    role?: AdminUniversityRole | string
    status?: AdminMembershipStatus | string
    university?: AdminUniversityLite | null
  }>
}

export type AdminUserDetail = AdminUserListItem & {
  authoredCourses?: Array<{
    id: string
    title?: string | null
    slug?: string | null
    status?: AdminCourseStatus | string
    scope?: AdminCourseScope | string
    createdAt?: string
  }>
  enrollments?: Array<{
    id: string
    status?: AdminEnrollmentStatus | string
    createdAt?: string
    completedAt?: string | null
    course?: {
      id: string
      title?: string | null
      slug?: string | null
      status?: AdminCourseStatus | string
    } | null
  }>
  _count?: {
    authoredCourses?: number
    enrollments?: number
    practiceSubmissions?: number
    assessmentAttempts?: number
  }
}

export type AdminSetUserRolePayload = {
  role: AdminRole
}

export type AdminSetUserTeamPayload = {
  teamId?: string | null
}

export type AdminSetUserUniversityPayload = {
  universityId?: string | null
}

export type AdminSetUserUniversityRolePayload = {
  universityId: string
  role: AdminUniversityRole
  status?: AdminMembershipStatus
}

export type AdminTeamsParams = AdminPageParams & {
  status?: AdminState | ""
}

export type AdminTeamListItem = AdminTeamLite & {
  description?: string | null
  leaderUserId?: string | null
  leader?: AdminUserLite | null
  university?: AdminUniversityLite | null
  membersCount?: number
  joinRequestsCount?: number
  coursesCount?: number
  createdAt?: string
  updatedAt?: string
}

export type AdminUniversitiesParams = AdminPageParams

export type AdminUniversityListItem = AdminUniversityLite & {
  city?: string | null
  region?: string | null
  usersCount?: number
  teamsCount?: number
  groupsCount?: number
  coursesCount?: number
  createdAt?: string
  updatedAt?: string
}

export type AdminUniversityMembersParams = AdminPageParams & {
  role?: AdminUniversityRole | ""
  status?: AdminMembershipStatus | ""
}

export type AdminUniversityMember = {
  id: string
  role?: AdminUniversityRole | string
  status?: AdminMembershipStatus | string
  createdAt?: string
  updatedAt?: string
  user?: AdminUserLite & {
    team?: AdminTeamLite | null
  }
}

export type AdminCoursesParams = AdminPageParams & {
  status?: AdminCourseStatus | ""
  scope?: AdminCourseScope | ""
}

export type AdminCourseListItem = {
  id: string
  title?: string | null
  slug?: string | null
  description?: string | null
  scope?: AdminCourseScope | string
  status?: AdminCourseStatus | string
  createdAt?: string
  updatedAt?: string
  author?: AdminUserLite | null
  university?: AdminUniversityLite | null
  team?: AdminTeamLite | null
  enrollmentsCount?: number
  theoryCount?: number
  practiceTasksCount?: number
  assessmentsCount?: number
}
