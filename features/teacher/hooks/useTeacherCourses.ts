import { useQuery } from "@tanstack/react-query"

import { TeacherService } from "../teacher.service"
import { teacherKeys } from "./teacher.query-keys"

export function useTeacherCourses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: teacherKeys.courses(),
    queryFn: () => TeacherService.getCourses(),
    enabled: options?.enabled ?? true,
  })
}
