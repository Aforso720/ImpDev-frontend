import { axiosWithAuth } from "@/lib/api/interceptors"

import type {
  LeaderboardQueryParams,
  LeaderboardSnapshotItem,
  LeaderboardSnapshotQueryParams,
  LeaderboardTeamsResponse,
  LeaderboardUsersResponse,
} from "./leaderboard.types"

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return
    searchParams.set(key, String(value))
  })

  return searchParams.toString()
}

export const LeaderboardService = {
  async getUsers(params: LeaderboardQueryParams = {}): Promise<LeaderboardUsersResponse> {
    const query = buildQuery({
      page: params.page ?? 1,
      limit: params.limit ?? 15,
      q: params.q?.trim() || undefined,
      universityId: params.universityId,
      teamId: params.teamId,
    })

    const response = await axiosWithAuth.get<LeaderboardUsersResponse>(`/leaderboard/users?${query}`)
    return response.data
  },

  async getTeams(params: LeaderboardQueryParams = {}): Promise<LeaderboardTeamsResponse> {
    const query = buildQuery({
      page: params.page ?? 1,
      limit: params.limit ?? 15,
      q: params.q?.trim() || undefined,
      universityId: params.universityId,
      teamId: params.teamId,
    })

    const response = await axiosWithAuth.get<LeaderboardTeamsResponse>(`/leaderboard/teams?${query}`)
    return response.data
  },

  async getSnapshots(params: LeaderboardSnapshotQueryParams = {}): Promise<LeaderboardSnapshotItem[]> {
    const query = buildQuery({
      limit: params.limit ?? 6,
      periodType: params.periodType,
      scope: params.scope,
    })

    const response = await axiosWithAuth.get<LeaderboardSnapshotItem[]>(`/leaderboard/snapshots?${query}`)
    return response.data
  },
}
