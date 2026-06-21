import type { IUser } from "@/lib/types"

export function hasActiveTeacherMembership(user?: IUser | null) {
  return Boolean(
    user?.universityMemberships?.some(
      (membership) =>
        membership.status === "ACTIVE" &&
        (membership.role === "INSTRUCTOR" || membership.role === "LEADER"),
    ),
  )
}

export function canAccessTeacherPanel(user?: IUser | null, hasManagedCourses = false) {
  return user?.role === "ADMIN" || hasActiveTeacherMembership(user) || hasManagedCourses
}
