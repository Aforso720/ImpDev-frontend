import { AdminCourseEditView } from "@/features/admin/components/AdminCourseEditView"

export default async function AdminCourseEditPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  return <AdminCourseEditView courseId={courseId} />
}
