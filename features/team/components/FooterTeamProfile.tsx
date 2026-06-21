import { CardTitle } from "@/components/ui/card"

import { useTeamStore } from "../team.store"

const FooterTeamProfile = () => {
  const teamMember = useTeamStore((s) => s.teamMembers)
  const teamRating = useTeamStore((s) => s.teamRating)
  const topInRatingMember = useTeamStore((s) => s.topInRatingMember)

  return (
    <footer className="mt-5 grid gap-4 border-y-4 border-border py-5 text-center text-foreground md:grid-cols-3">
      <div className="space-y-1">
        <CardTitle className="text-base font-medium sm:text-lg">Топ по рейтингу:</CardTitle>
        <span className="text-5xl font-bold text-primary sm:text-6xl xl:text-7xl">{topInRatingMember}</span>
      </div>

      <div className="space-y-1">
        <CardTitle className="text-base font-medium sm:text-lg">Участников:</CardTitle>
        <span className="text-5xl font-bold text-primary sm:text-6xl xl:text-7xl">{teamMember}</span>
      </div>

      <div className="space-y-1">
        <CardTitle className="text-base font-medium sm:text-lg">Рейтинг команды:</CardTitle>
        <span className="text-5xl font-bold text-primary sm:text-6xl xl:text-7xl">{teamRating}</span>
      </div>
    </footer>
  )
}

export default FooterTeamProfile
