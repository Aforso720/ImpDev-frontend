import { CourseOverview } from "@/features/course/components/CourseOverview"

export default async function CourseSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <CourseOverview slug={slug} />
}
