import { CourseContentManager } from "@/features/course/components/CourseContentManager"

export default async function TeacherCourseContentPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  return <CourseContentManager courseId={courseId} backHref={`/teacher/courses/${courseId}/edit`} />
}
