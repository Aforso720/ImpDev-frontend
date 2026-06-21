import type { CourseAuthor, CourseScope, CourseStatus, PracticeDifficulty } from "./course.types"

export type AssessmentKind = "TASK" | "EXAM"
export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export type CourseAssessment = {
  id: string
  courseId: string
  authorId: string
  kind: AssessmentKind
  status: AssessmentStatus
  title: string
  descriptionMd: string
  stack: string[]
  difficulty: PracticeDifficulty
  maxScore: number
  ratingWeight: number
  deadlineAt: string | null
  attemptsLimit: number | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CourseAssessmentListItem = Omit<
  CourseAssessment,
  "courseId" | "authorId" | "descriptionMd" | "publishedAt" | "updatedAt"
> & {
  course: {
    id: string
    title: string
    slug: string
    scope: CourseScope
  }
  author: CourseAuthor
  _count: {
    attempts: number
  }
}

export type CourseAssessmentDetail = Omit<CourseAssessment, "courseId"> & {
  author: CourseAuthor
  course: {
    id: string
    title: string
    slug: string
    status: CourseStatus
    scope: CourseScope
    universityId: string | null
    teamId: string | null
    authorId: string
  }
  _count: {
    attempts: number
  }
}

export type CourseAssessmentsPage = {
  items: CourseAssessmentListItem[]
  total: number
  page: number
  limit: number
}

export type CreateAssessmentPayload = {
  courseId: string
  kind?: AssessmentKind
  title: string
  descriptionMd: string
  stack?: string[]
  difficulty?: PracticeDifficulty
  maxScore?: number
  ratingWeight?: number
  deadlineAt?: string
  attemptsLimit?: number
}

export type UpdateAssessmentPayload = {
  kind?: AssessmentKind
  title?: string
  descriptionMd?: string
  stack?: string[]
  difficulty?: PracticeDifficulty
  maxScore?: number
  ratingWeight?: number
  deadlineAt?: string | null
  attemptsLimit?: number | null
}
