import { TeamProfile } from "@/features/team/components/TeamProfile"
import TeamSearchBlock from "@/features/team/components/TeamSearchBlock"

export default function TeamPage(){
    return(
        <section className="flex flex-col">
            <TeamProfile/>
            <TeamSearchBlock/>
        </section>
    )
} 