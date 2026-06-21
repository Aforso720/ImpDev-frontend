import { useQuery } from "@tanstack/react-query"

import { TeacherService } from "../teacher.service"
import type { TeacherPracticeSubmissionsParams } from "../teacher.types"
import { teacherKeys } from "./teacher.query-keys"

export function useTeacherPracticeSubmissions(params: TeacherPracticeSubmissionsParams = {}) {
  return useQuery({
    queryKey: teacherKeys.practiceSubmissions(params),
    queryFn: () => TeacherService.getPracticeSubmissions(params),
  })
}
