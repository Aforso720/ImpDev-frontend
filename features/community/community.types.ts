export type PostVisibility = "PUBLIC" | "UNIVERSITY" | "GROUP"
export type PostCategoryKey = "NEWS" | "ANNOUNCEMENT" | "EVENT" | "ACHIEVEMENT" | "TEAM_RECRUITMENT"
export type PostReactionType = "LIKE" | "SUPPORT" | "CELEBRATE"
export type EventFormat = "ONLINE" | "OFFLINE" | "HYBRID"
export type EventRegistrationStatus = "REGISTERED" | "CANCELLED" | "WAITLISTED"
export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED"
export type CommunityOrderStatus =
  | "DRAFT"
  | "OPEN"
  | "IN_PROGRESS"
  | "REVIEW"
  | "DONE"
  | "CANCELLED"
  | "ARCHIVED"
export type PracticeDifficulty = "EASY" | "MEDIUM" | "HARD"

export type CommunityAuthor = {
  id: string
  name: string
  avatarUrl: string | null
}

export type CommunityUniversity = {
  id: string
  name: string
  slug: string
}

export type CommunityGroup = {
  id: string
  name: string
}

export type PostCategoryItem = {
  id: string
  key: PostCategoryKey
  title: string
  description?: string | null
}

export type PostCommentItem = {
  id: string
  contentMd: string
  createdAt: string
  parentId: string | null
  author: CommunityAuthor
  replies: PostCommentItem[]
}

export type PostFeedItem = {
  id: string
  title: string
  contentMd: string
  coverUrl: string | null
  visibility: PostVisibility
  publishedAt: string | null
  createdAt: string
  author: CommunityAuthor
  university: CommunityUniversity | null
  group: CommunityGroup | null
  categories: PostCategoryItem[]
  myReaction: PostReactionType | null
  _count: {
    reactions: number
    comments: number
  }
}

export type PostDetail = PostFeedItem & {
  updatedAt: string
  comments: PostCommentItem[]
}

export type EventListItem = {
  id: string
  title: string
  description: string
  format: EventFormat
  startAt: string
  endAt: string
  location: string
  capacity: number | null
  registrationDeadline: string | null
  university: CommunityUniversity | null
  group: CommunityGroup | null
  _count: {
    registrations: number
  }
}

export type ProjectListItem = {
  id: string
  title: string
  summary: string
  descriptionMd: string
  status: ProjectStatus
  startDate: string
  endDate: string | null
  demoUrl: string | null
  repoUrl: string | null
  owner: CommunityAuthor
  university: CommunityUniversity | null
  group: CommunityGroup | null
  _count: {
    members: number
    updates: number
  }
}

export type CommunityOrderItem = {
  id: string
  title: string
  summary: string
  descriptionMd: string
  status: CommunityOrderStatus
  level: PracticeDifficulty
  techStack: string[]
  budgetMin: number | null
  budgetMax: number | null
  currency: string
  deadlineAt: string | null
  publishedAt: string | null
  createdAt: string
  author: CommunityAuthor
  assigneeUser: CommunityAuthor | null
  university: CommunityUniversity | null
  team: CommunityGroup | null
}

export type CommunityPaginated<T> = {
  items: T[]
  total: number
  page: number
  limit: number
  isDemo?: boolean
}

export type PostQueryParams = {
  page?: number
  limit?: number
  q?: string
  categoryKey?: PostCategoryKey
  visibility?: PostVisibility
  universityId?: string
  groupId?: string
}

export type CreatePostPayload = {
  title: string
  contentMd: string
  coverUrl?: string
  visibility: PostVisibility
  categoryKeys: PostCategoryKey[]
  universityId?: string
  groupId?: string
}

export type CreatePostCommentPayload = {
  contentMd: string
  parentId?: string
}

export type ReactPostPayload = {
  type?: PostReactionType
}

export type ReactPostResponse = {
  ok: boolean
  active: boolean
  type: PostReactionType | null
  reactionsCount: number
}

export type UpdatePostPayload = {
  title?: string
  contentMd?: string
  coverUrl?: string
  categoryKeys?: PostCategoryKey[]
}

export type EventQueryParams = {
  page?: number
  limit?: number
  q?: string
  upcomingOnly?: boolean
}

export type ProjectQueryParams = {
  page?: number
  limit?: number
  q?: string
  status?: ProjectStatus
}

export type CommunityOrderQueryParams = {
  page?: number
  limit?: number
  q?: string
  status?: CommunityOrderStatus
  level?: PracticeDifficulty
  universityId?: string
  teamId?: string
}
