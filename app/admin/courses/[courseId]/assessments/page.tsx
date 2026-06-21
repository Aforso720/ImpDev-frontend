import { CourseAssessmentsManager } from "@/features/course/components/CourseAssessmentsManager"

export default async function AdminCourseAssessmentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  return <CourseAssessmentsManager courseId={courseId} backHref={`/admin/courses/${courseId}/edit`} />
}
