export const assessmentKeys = {
  all: ["assessments"] as const,
  courses: () => [...assessmentKeys.all, "course"] as const,
  course: (courseId: string) => [...assessmentKeys.courses(), courseId] as const,
  details: () => [...assessmentKeys.all, "detail"] as const,
  detail: (assessmentId: string) => [...assessmentKeys.details(), assessmentId] as const,
}
