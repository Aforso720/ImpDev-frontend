import type { TeacherAssessmentAttemptsParams, TeacherPracticeSubmissionsParams } from "../teacher.types"

export const teacherKeys = {
  all: ["teacher"] as const,
  overview: () => [...teacherKeys.all, "overview"] as const,
  courses: () => [...teacherKeys.all, "courses"] as const,
  courseStudents: (courseId: string) => [...teacherKeys.all, "courses", courseId, "students"] as const,
  courseProgress: (courseId: string) => [...teacherKeys.all, "courses", courseId, "progress"] as const,
  practiceSubmissions: (params: TeacherPracticeSubmissionsParams) =>
    [...teacherKeys.all, "practice-submissions", params] as const,
  assessmentAttempts: (params: TeacherAssessmentAttemptsParams) =>
    [...teacherKeys.all, "assessment-attempts", params] as const,
}
