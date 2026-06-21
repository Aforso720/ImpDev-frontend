import { useQuery } from "@tanstack/react-query"

import { TeacherService } from "../teacher.service"
import type { TeacherAssessmentAttemptsParams } from "../teacher.types"
import { teacherKeys } from "./teacher.query-keys"

export function useTeacherAssessmentAttempts(params: TeacherAssessmentAttemptsParams = {}) {
  return useQuery({
    queryKey: teacherKeys.assessmentAttempts(params),
    queryFn: () => TeacherService.getAssessmentAttempts(params),
  })
}
