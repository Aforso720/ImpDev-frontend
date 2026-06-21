import { CourseLearningPage } from "@/features/course/components/CourseLearningPage"

export default async function CourseLearnPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <CourseLearningPage slug={slug} />
}
