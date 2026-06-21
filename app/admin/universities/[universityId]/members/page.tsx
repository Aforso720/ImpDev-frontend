import { AdminUniversityMembersView } from "@/features/admin/components/AdminUniversityMembersView"

export default async function AdminUniversityMembersPage({
  params,
}: {
  params: Promise<{ universityId: string }>
}) {
  const { universityId } = await params
  return <AdminUniversityMembersView universityId={universityId} />
}
