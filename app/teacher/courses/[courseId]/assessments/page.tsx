import { CourseAssessmentsManager } from "@/features/course/components/CourseAssessmentsManager"

export default async function TeacherCourseAssessmentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  return <CourseAssessmentsManager courseId={courseId} backHref={`/teacher/courses/${courseId}/edit`} />
}
