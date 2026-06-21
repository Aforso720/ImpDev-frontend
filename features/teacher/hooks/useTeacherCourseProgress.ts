import { useQuery } from "@tanstack/react-query"

import { TeacherService } from "../teacher.service"
import { teacherKeys } from "./teacher.query-keys"

export function useTeacherCourseProgress(courseId: string) {
  return useQuery({
    queryKey: teacherKeys.courseProgress(courseId),
    queryFn: () => TeacherService.getCourseProgress(courseId),
    enabled: Boolean(courseId),
  })
}
