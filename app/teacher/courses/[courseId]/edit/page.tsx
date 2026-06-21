import { TeacherCourseEditView } from "@/features/teacher/components/TeacherCourseEditView"

export default async function TeacherCourseEditPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  return <TeacherCourseEditView courseId={courseId} />
}
