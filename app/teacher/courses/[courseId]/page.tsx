import { TeacherCourseDetailView } from "@/features/teacher/components/TeacherCourseDetailView"

export default async function TeacherCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  return <TeacherCourseDetailView courseId={courseId} />
}
