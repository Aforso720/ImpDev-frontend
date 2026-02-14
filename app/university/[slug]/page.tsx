import { UniversityProfile } from "@/features/university/components/UniversityProfile"

export default async function UniversitySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <UniversityProfile slug={slug} />
}
