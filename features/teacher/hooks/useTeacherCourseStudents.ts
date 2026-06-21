import { useQuery } from "@tanstack/react-query"

import { TeacherService } from "../teacher.service"
import { teacherKeys } from "./teacher.query-keys"

export function useTeacherCourseStudents(courseId: string) {
  return useQuery({
    queryKey: teacherKeys.courseStudents(courseId),
    queryFn: () => TeacherService.getCourseStudents(courseId),
    enabled: Boolean(courseId),
  })
}
