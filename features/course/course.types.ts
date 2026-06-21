export type CourseScope = "PUBLIC" | "UNIVERSITY" | "TEAM"
export type CourseScopeFilter = CourseScope | "ALL"
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"
export type PracticeDifficulty = "EASY" | "MEDIUM" | "HARD"
export type PracticeSubmissionStatus = "SUBMITTED" | "APPROVED" | "REJECTED"

export type CreateCoursePayload = {
  title: string
  slug: string
  description: string
  scope?: CourseScope
  universityId?: string
  teamId?: string
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>

export type Course = {
  id: string
  title: string
  slug: string
  description: string
  status: CourseStatus
  scope: CourseScope
  authorId: string
  universityId: string | null
  teamId: string | null
  createdAt: string
  updatedAt: string
}

export type CourseAuthor = {
  id: string
  name: string
  avatarUrl: string | null
}

export type ManageableCourse = Course & {
  author: CourseAuthor
}

export type CourseTheoryBlock = {
  id: string
  title: string
  contentMd: string
  order: number
  createdAt: string
  updatedAt: string
}

export type CreateTheoryPayload = {
  title: string
  contentMd: string
  order: number
}

export type UpdateTheoryPayload = Partial<CreateTheoryPayload>

export type CoursePracticeTask = {
  id: string
  title: string
  statementMd: string
  stack: string[]
  difficulty: PracticeDifficulty
  maxScore: number
  order: number
  timeLimitMs?: number | null
  memoryLimitMb?: number | null
  externalRef?: string | null
}

export type CreatePracticeTaskPayload = {
  title: string
  statementMd: string
  stack?: string[]
  difficulty?: PracticeDifficulty
  maxScore: number
  order: number
  timeLimitMs?: number
  memoryLimitMb?: number
  externalRef?: string
}

export type UpdatePracticeTaskPayload = Partial<CreatePracticeTaskPayload>

export type PracticeSubmission = {
  id: string
  practiceTaskId: string
  userId: string
  answerText?: string | null
  status: PracticeSubmissionStatus
  score?: number | null
  comment?: string | null
  checkedAt?: string | null
  checkedById?: string | null
  createdAt: string
  updatedAt: string
}

export type UpsertPracticeSubmissionRequest = {
  answerText: string
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

export type CourseDetail = Course & {
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

export type CourseEnrollment = {
  id: string
  courseId: string
  userId: string
  status: "ENROLLED" | "COMPLETED"
  createdAt: string
  updatedAt: string
  completedAt: string | null
}
