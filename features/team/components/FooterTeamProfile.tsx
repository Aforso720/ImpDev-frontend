import { CardTitle } from "@/components/ui/card"
import { useTeamStore } from "../team.store"

const FooterTeamProfile = () => {
  const teamMember = useTeamStore((s)=>s.teamMembers)
  const teamRating = useTeamStore((s)=>s.teamRating)
  const topInRatingMember = useTeamStore((s)=>s.topInRatingMember)
  return (
    <footer className="mt-5 flex gap-5 border-y-4 border-brand-soft py-5 text-center text-ink-strong">
        <div className="flex-1/3">
            <CardTitle className="text-xl font-medium">Топ по рейтингу:</CardTitle>
            <span className="text-8xl font-bold text-brand-strong">{topInRatingMember}</span>
        </div>  
        <div className="flex-1/3">
            <CardTitle className="text-xl font-medium">Участников:</CardTitle>
            <span className="text-8xl font-bold text-brand-strong">{teamMember}</span>
        </div>   
        <div className="flex-1/3">
            <CardTitle className="text-xl font-medium">Рейтинг команды:</CardTitle>
            <span className="text-8xl font-bold text-brand-strong">{teamRating}</span>
        </div>  
    </footer>
  )
}

export default FooterTeamProfile
