import { MyCoursesCatalog } from "@/features/course/components/MyCoursesCatalog"

export default async function MyCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  return <MyCoursesCatalog status={status} />
}
