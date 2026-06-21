import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { AdminService } from "../admin.service"
import type {
  AdminCoursesParams,
  AdminSetUserRolePayload,
  AdminSetUserTeamPayload,
  AdminSetUserUniversityPayload,
  AdminSetUserUniversityRolePayload,
  AdminTeamsParams,
  AdminUniversitiesParams,
  AdminUniversityMembersParams,
  AdminUsersParams,
} from "../admin.types"
import { adminKeys } from "./admin.query-keys"

function useAdminInvalidation() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: adminKeys.all })
}

export function useAdminOverview() {
  return useQuery({
    queryKey: adminKeys.overview(),
    queryFn: () => AdminService.getOverview(),
  })
}

export function useAdminUsers(params: AdminUsersParams) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => AdminService.getUsers(params),
  })
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: adminKeys.user(userId),
    queryFn: () => AdminService.getUser(userId),
    enabled: Boolean(userId),
  })
}

export function useSetAdminUserRole() {
  const invalidate = useAdminInvalidation()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminSetUserRolePayload }) =>
      AdminService.setUserRole(id, payload),
    onSuccess: async () => {
      await invalidate()
      toast.success("Роль пользователя обновлена")
    },
    onError: () => toast.error("Не удалось обновить роль"),
  })
}

export function useSetAdminUserTeam() {
  const invalidate = useAdminInvalidation()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminSetUserTeamPayload }) =>
      AdminService.setUserTeam(id, payload),
    onSuccess: async () => {
      await invalidate()
      toast.success("Команда пользователя обновлена")
    },
    onError: () => toast.error("Не удалось обновить команду"),
  })
}

export function useSetAdminUserUniversity() {
  const invalidate = useAdminInvalidation()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminSetUserUniversityPayload }) =>
      AdminService.setUserUniversity(id, payload),
    onSuccess: async () => {
      await invalidate()
      toast.success("Университет пользователя обновлен")
    },
    onError: () => toast.error("Не удалось обновить университет"),
  })
}

export function useSetAdminUserUniversityRole() {
  const invalidate = useAdminInvalidation()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminSetUserUniversityRolePayload }) =>
      AdminService.setUserUniversityRole(id, payload),
    onSuccess: async () => {
      await invalidate()
      toast.success("Роль в университете обновлена")
    },
    onError: () => toast.error("Не удалось обновить роль в университете"),
  })
}

export function useDeleteAdminUser() {
  const invalidate = useAdminInvalidation()

  return useMutation({
    mutationFn: (id: string) => AdminService.deleteUser(id),
    onSuccess: async () => {
      await invalidate()
      toast.success("Пользователь удален")
    },
    onError: () => toast.error("Не удалось удалить пользователя"),
  })
}

export function useAdminTeams(params: AdminTeamsParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.teams(params),
    queryFn: () => AdminService.getTeams(params),
    enabled: options?.enabled ?? true,
  })
}

export function useApproveAdminTeam() {
  const invalidate = useAdminInvalidation()

  return useMutation({
    mutationFn: (id: string) => AdminService.approveTeam(id),
    onSuccess: async () => {
      await invalidate()
      toast.success("Команда одобрена")
    },
    onError: () => toast.error("Не удалось одобрить команду"),
  })
}

export function useRejectAdminTeam() {
  const invalidate = useAdminInvalidation()

  return useMutation({
    mutationFn: (id: string) => AdminService.rejectTeam(id),
    onSuccess: async () => {
      await invalidate()
      toast.success("Команда отклонена")
    },
    onError: () => toast.error("Не удалось отклонить команду"),
  })
}

export function useDeleteAdminTeam() {
  const invalidate = useAdminInvalidation()

  return useMutation({
    mutationFn: (id: string) => AdminService.deleteTeam(id),
    onSuccess: async () => {
      await invalidate()
      toast.success("Команда удалена")
    },
    onError: () => toast.error("Не удалось удалить команду"),
  })
}

export function useAdminUniversities(params: AdminUniversitiesParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.universities(params),
    queryFn: () => AdminService.getUniversities(params),
    enabled: options?.enabled ?? true,
  })
}

export function useAdminUniversityMembers(universityId: string, params: AdminUniversityMembersParams) {
  return useQuery({
    queryKey: adminKeys.universityMembers(universityId, params),
    queryFn: () => AdminService.getUniversityMembers(universityId, params),
    enabled: Boolean(universityId),
  })
}

export function useAdminCourses(params: AdminCoursesParams) {
  return useQuery({
    queryKey: adminKeys.courses(params),
    queryFn: () => AdminService.getCourses(params),
  })
}
