export type LeaderboardScope = "GLOBAL" | "UNIVERSITY" | "TEAM"
export type LeaderboardPeriodType = "DAILY" | "WEEKLY" | "MONTHLY" | "ALL_TIME"

export type LeaderboardUserItem = {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  teamId: string | null
  ratingTotal: number
  ratingAuto: number
  ratingManual: number
  profile: {
    level: number
    xp: number
    xpToNextLevel: number
  } | null
}

export type LeaderboardTeamItem = {
  id: string
  name: string
  avatarUrl: string | null
  leaderUserId: string
  ratingTotal: number
  ratingAuto: number
  ratingManual: number
  createdAt: string
  _count: {
    users: number
  }
}

export type LeaderboardSnapshotItem = {
  id: string
  periodType: LeaderboardPeriodType
  periodStart: string
  periodEnd: string
  scope: LeaderboardScope
  createdAt: string
  rowsJson: {
    users?: Array<{
      rank: number
      id: string
      name: string
      avatarUrl: string | null
      ratingTotal: number
      level?: number
    }>
    teams?: Array<{
      rank: number
      id: string
      name: string
      avatarUrl: string | null
      ratingTotal: number
    }>
    meta?: Record<string, unknown>
  }
  generatedBy: {
    id: string
    name: string
  } | null
  university: {
    id: string
    name: string
    slug: string
  } | null
  team: {
    id: string
    name: string
  } | null
}

export type LeaderboardUsersResponse = {
  items: LeaderboardUserItem[]
  total: number
  page: number
  limit: number
}

export type LeaderboardTeamsResponse = {
  items: LeaderboardTeamItem[]
  total: number
  page: number
  limit: number
}

export type LeaderboardQueryParams = {
  page?: number
  limit?: number
  q?: string
  universityId?: string
  teamId?: string
}

export type LeaderboardSnapshotQueryParams = {
  limit?: number
  periodType?: LeaderboardPeriodType
  scope?: LeaderboardScope
}
