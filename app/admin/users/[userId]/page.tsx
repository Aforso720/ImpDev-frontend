import { AdminUserDetailView } from "@/features/admin/components/AdminUserDetailView"

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  return <AdminUserDetailView userId={userId} />
}
