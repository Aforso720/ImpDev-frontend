export type TeacherCourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"
export type TeacherCourseScope = "PUBLIC" | "UNIVERSITY" | "TEAM"
export type TeacherEnrollmentStatus = "ENROLLED" | "COMPLETED"
export type TeacherPracticeSubmissionStatus = "SUBMITTED" | "APPROVED" | "REJECTED"
export type TeacherAssessmentAttemptStatus =
  | "SCHEDULED"
  | "SUBMITTED"
  | "PASSED"
  | "FAILED"
  | "NEEDS_REVISION"

export type TeacherUser = {
  id: string
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
}

export type TeacherOverview = {
  coursesTotal?: number
  studentsTotal?: number
  practiceSubmissionsInReview?: number
  assessmentAttemptsInReview?: number
}

export type TeacherCourse = {
  id: string
  title?: string | null
  slug?: string | null
  description?: string | null
  status?: TeacherCourseStatus | string
  scope?: TeacherCourseScope | string
  createdAt?: string
  updatedAt?: string
  author?: TeacherUser | null
  university?: {
    id: string
    name?: string | null
    slug?: string | null
    shortName?: string | null
  } | null
  team?: {
    id: string
    name?: string | null
    avatarUrl?: string | null
  } | null
  studentsTotal?: number
  practiceTasksTotal?: number
  assessmentsTotal?: number
  averageProgress?: number
  canManage?: boolean
}

export type TeacherStudentProgress = {
  enrollmentId: string
  user: TeacherUser
  status?: TeacherEnrollmentStatus | string
  progressPercent?: number
  approvedPracticeTasks?: number
  passedAssessments?: number
  enrolledAt?: string
  completedAt?: string | null
  lastActivityAt?: string | null
}

export type TeacherCourseStudentsResponse = {
  courseId: string
  total?: number
  items?: TeacherStudentProgress[]
}

export type TeacherCourseProgress = {
  courseId: string
  totalStudents?: number
  startedStudents?: number
  completedStudents?: number
  averageProgress?: number
  measurableItems?: {
    practiceTasks?: number
    assessments?: number
    total?: number
  }
  students?: TeacherStudentProgress[]
}

export type TeacherPracticeSubmissionsParams = {
  courseId?: string
  status?: TeacherPracticeSubmissionStatus | ""
}

export type TeacherPracticeSubmission = {
  id: string
  status?: TeacherPracticeSubmissionStatus | string
  score?: number | null
  comment?: string | null
  answerPreview?: string | null
  answerTextLength?: number
  createdAt?: string
  updatedAt?: string
  checkedAt?: string | null
  user?: TeacherUser | null
  checkedBy?: TeacherUser | null
  practiceTask?: {
    id: string
    title?: string | null
    order?: number | null
    maxScore?: number | null
    course?: {
      id: string
      title?: string | null
      slug?: string | null
    } | null
  } | null
}

export type TeacherPracticeSubmissionsResponse = {
  total?: number
  items?: TeacherPracticeSubmission[]
}

export type ReviewPracticeSubmissionPayload = {
  status: "APPROVED" | "REJECTED"
  score?: number
  comment?: string
}

export type TeacherAssessmentAttemptsParams = {
  courseId?: string
  status?: TeacherAssessmentAttemptStatus | ""
}

export type TeacherAssessmentAttempt = {
  id: string
  attemptNo?: number
  status?: TeacherAssessmentAttemptStatus | string
  score?: number | null
  comment?: string | null
  answerPreview?: string | null
  answerTextLength?: number
  artifactUrl?: string | null
  submittedAt?: string
  reviewedAt?: string | null
  createdAt?: string
  updatedAt?: string
  user?: TeacherUser | null
  reviewer?: TeacherUser | null
  assessment?: {
    id: string
    title?: string | null
    kind?: string | null
    maxScore?: number | null
    course?: {
      id: string
      title?: string | null
      slug?: string | null
    } | null
  } | null
}

export type TeacherAssessmentAttemptsResponse = {
  total?: number
  items?: TeacherAssessmentAttempt[]
}

export type ReviewAssessmentAttemptPayload = {
  status: "PASSED" | "FAILED" | "NEEDS_REVISION"
  score?: number
  comment?: string
}
