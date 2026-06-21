import { useQuery } from "@tanstack/react-query"

import { TeacherService } from "../teacher.service"
import { teacherKeys } from "./teacher.query-keys"

export function useTeacherOverview() {
  return useQuery({
    queryKey: teacherKeys.overview(),
    queryFn: () => TeacherService.getOverview(),
  })
}
