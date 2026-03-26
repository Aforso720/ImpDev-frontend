export type CourseScope = "PUBLIC" | "UNIVERSITY" | "TEAM"
export type CourseScopeFilter = CourseScope | "ALL"
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export type CourseAuthor = {
  id: string
  name: string
  avatarUrl: string | null
}

export type CourseTheoryBlock = {
  id: string
  title: string
  contentMd: string
  order: number
  createdAt: string
  updatedAt: string
}

export type CoursePracticeTask = {
  id: string
  title: string
  statementMd: string
  maxScore: number
  order: number
  timeLimitMs?: number | null
  memoryLimitMb?: number | null
  externalRef?: string | null
}

export type CourseListItem = {
  id: string
  title: string
  slug: string
  description: string
  scope: CourseScope
  status: CourseStatus
  createdAt: string
  author: CourseAuthor
}

export type PaginatedCourses = {
  items: CourseListItem[]
  total: number
  page: number
  limit: number
}

export type CourseDetail = {
  id: string
  title: string
  slug: string
  description: string
  status: CourseStatus
  scope: CourseScope
  authorId: string
  universityId?: string | null
  teamId?: string | null
  createdAt: string
  updatedAt: string
  author: CourseAuthor
  theory: CourseTheoryBlock[]
  practiceTasks: CoursePracticeTask[]
}

export type AuthoredCourseItem = {
  id: string
  title: string
  slug: string
  status: CourseStatus
  scope: CourseScope
  createdAt: string
}

export type CourseQueryParams = {
  page?: number
  limit?: number
  q?: string
  scope?: CourseScopeFilter
}
