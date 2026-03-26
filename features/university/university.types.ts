export type UniversityLinkType = "WEBSITE" | "VK" | "TELEGRAM" | "YOUTUBE" | "OTHER"

export type UniversitySocialLink = {
  id: string
  type: UniversityLinkType
  title: string | null
  url: string
}

export type UniversityFact = {
  id: string
  label: string
  value: string
  order: number
}

export type ProgramLevel = "BACHELOR" | "MASTER" | "PHD"
export type UniversityProgram = {
  id: string
  name: string
  level: ProgramLevel | null
  description: string | null
}

export type UniversityTag = {
  value: string
}

export type UniversityItem = {
  id: string
  name: string
  slug: string

  avatarUrl: string | null
  bannerUrl: string | null
  description: string | null

  websiteUrl: string | null
  city: string | null
  region: string | null
  address: string | null

  admissionsUrl: string | null
  admissionsEmail: string | null
  admissionsPhone: string | null

  contactEmail: string | null
  partnershipsEmail: string | null

  hasDormitory: boolean
  isState: boolean
  hasMilitaryCenter: boolean
  hasAccreditation: boolean

  status: "ACTIVE" | "SUSPENDED"
  timezone: string | null

  createdAt: string
  updatedAt: string

  inviteUrl: string | null // ✅ если ты реально возвращаешь это поле с бэка

  _count: {
    memberships: number
  }

  tags: UniversityTag[]
  socialLinks: UniversitySocialLink[]
  facts: UniversityFact[]
  programs: UniversityProgram[]
}

export type UniversityInviteMeta = {
  id: string
  tokenPrefix: string
  expiresAt: string | Date | null
  maxUses: number | null
  usedCount: number
  revokedAt: string | Date | null
  createdAt: string | Date
  groupId: string | null
}
export type UniversityProgramItem = { id: string; name: string; level?: string | null; description?: string | null }
export type UniversityFactItem = { id: string; label: string; value: string; order: number }

export type UniversityProfileData = UniversityItem &
  Partial<{
    shortName: string | null
    foundedYear: number | null
    rectorName: string | null
    motto: string | null
    mission: string | null
    aboutShort: string | null
    aboutFullMd: string | null

    mapUrl: string | null
    dormitoryInfoUrl: string | null
    scholarshipsUrl: string | null
    careerCenterUrl: string | null
    internationalUrl: string | null

    partnershipsEmail: string | null

    programs: UniversityProgramItem[]
    facts: UniversityFactItem[]
    invites: UniversityInviteMeta[]
  }>

export type UniversityMembershipItem = UniversityItem & {
  myRole: "LEADER" | "INSTRUCTOR" | "STUDENT"
  myStatus: "ACTIVE" | "BLOCKED"
}

export type UniversityGroupItem = {
  id: string
  universityId: string
  name: string
  type: "ACADEMIC_GROUP" | "STREAM"
  description: string | null
}
