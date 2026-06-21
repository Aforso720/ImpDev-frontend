import { CourseLearningPage } from "@/features/course/components/CourseLearningPage"

export default async function CourseLearnBlockPage({
  params,
}: {
  params: Promise<{ slug: string; blockId: string }>
}) {
  const { slug, blockId } = await params
  return <CourseLearningPage slug={slug} blockId={blockId} />
}
