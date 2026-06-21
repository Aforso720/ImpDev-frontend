import { useQuery } from "@tanstack/react-query"

import { CourseService } from "../course.service"
import { courseKeys } from "./course.query-keys"

export function useManageableCourse(courseId: string) {
  return useQuery({
    queryKey: courseKeys.manageable(courseId),
    queryFn: () => CourseService.getManageableCourseById(courseId),
    enabled: Boolean(courseId),
  })
}
