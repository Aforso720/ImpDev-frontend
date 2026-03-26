import { CommunityHighlights } from "@/features/community/components/CommunityHighlights"
import { SidebarLayout } from "@/features/ui/SidebarLayout"

export default function CommunityPage() {
  return (
    <SidebarLayout>
      <CommunityHighlights postsLimit={8} eventsLimit={6} projectsLimit={6} />
    </SidebarLayout>
  )
}
