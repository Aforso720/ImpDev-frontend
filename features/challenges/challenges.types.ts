export type AssessmentKind = "TASK" | "EXAM"
export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"
export type PracticeDifficulty = "EASY" | "MEDIUM" | "HARD"

export type AssessmentListItem = {
  id: string
  title: string
  kind: AssessmentKind
  status: AssessmentStatus
  stack: string[]
  difficulty: PracticeDifficulty
  maxScore: number
  ratingWeight: number
  deadlineAt: string | null
  attemptsLimit: number | null
  createdAt: string
  course: {
    id: string
    title: string
    slug: string
    scope: "PUBLIC" | "UNIVERSITY" | "TEAM"
  }
  author: {
    id: string
    name: string
    avatarUrl: string | null
  }
  _count: {
    attempts: number
  }
}

export type PaginatedAssessments = {
  items: AssessmentListItem[]
  total: number
  page: number
  limit: number
}

export type AssessmentQueryParams = {
  page?: number
  limit?: number
  q?: string
  courseId?: string
  kind?: AssessmentKind
  status?: AssessmentStatus
}

