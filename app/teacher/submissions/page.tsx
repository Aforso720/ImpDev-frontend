import { TeacherSubmissionsView } from "@/features/teacher/components/TeacherSubmissionsView"

export default async function TeacherSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>
}) {
  const { courseId } = await searchParams
  return <TeacherSubmissionsView initialCourseId={courseId ?? ""} />
}
