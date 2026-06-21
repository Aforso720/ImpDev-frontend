import { CourseContentManager } from "@/features/course/components/CourseContentManager"

export default async function AdminCourseContentPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  return <CourseContentManager courseId={courseId} backHref={`/admin/courses/${courseId}/edit`} />
}
