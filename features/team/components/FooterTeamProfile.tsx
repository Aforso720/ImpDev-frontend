import { CardTitle } from "@/components/ui/card"
import { useTeamStore } from "../team.store"

const FooterTeamProfile = () => {
  const teamMember = useTeamStore((s)=>s.teamMembers)
  const teamRating = useTeamStore((s)=>s.teamRating)
  const topInRatingMember = useTeamStore((s)=>s.topInRatingMember)
  return (
    <footer className="flex gap-5 mt-5 text-center border-y-4 py-5 ">
        <div className="flex-1/3">
            <CardTitle className="text-xl font-medium">Топ по рейтингу:</CardTitle>
            <span className="text-8xl font-bold text-[#C7D9E5]">{topInRatingMember}</span>
        </div>  
        <div className="flex-1/3">
            <CardTitle className="text-xl font-medium">Участников:</CardTitle>
            <span className="text-8xl font-bold text-[#C7D9E5]">{teamMember}</span>
        </div>   
        <div className="flex-1/3">
            <CardTitle className="text-xl font-medium">Рейтинг команды:</CardTitle>
            <span className="text-8xl font-bold text-[#C7D9E5]">{teamRating}</span>
        </div>  
    </footer>
  )
}

export default FooterTeamProfile
