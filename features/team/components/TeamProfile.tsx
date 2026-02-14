'use client'
import React from "react"
import { TableTeamProfile } from "@/features/team/components/TableTeamProfile"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { Trash2, Pencil } from "lucide-react"
import { TeamService } from "../team.service"
import { formatDate } from "@/lib/format-date"
import { utilsService } from "@/lib/services/utils.service"
import { MAIN_COLOR } from "@/lib/constants/colors.constants"
import FooterTeamProfile from "./FooterTeamProfile"
import JoinRequestsTeamProfile from "./JoinRequestsTeamProfile"
import { useTeamStore } from "../team.store"
import { userService } from "@/lib/services/user.service"
import { SpinnerSize } from "@/components/ui/spinner-size"
import { ConfirmDialog } from "@/components/confrim-dialog"
import { Button } from "@/components/ui/button"
import { CreateTeamDialog } from "./CreateTeamDialog"

export const TeamProfile = () => {
  const isMemberTeam = useTeamStore((s) => s.isMemberTeam)
  const setIsMemberTeam = useTeamStore((s) => s.setIsMemberTeam)
  const setTeamRating = useTeamStore((s) => s.setTeamRating)
  const isTeamLeader = useTeamStore((state) => state.isTeamLeader)

  const {data:team} = useQuery({
    queryKey:['team','me'],
    queryFn:()=>TeamService.getMeTeam(),
    enabled: isMemberTeam,
  })

  const { data: user, isLoading } = useQuery({
      queryKey: ["user", "me"],
      queryFn: () => userService.getProfile(),
  })

  React.useEffect(() => {
    if (!user) return 
    setIsMemberTeam(!!user.teamId)
  }, [user?.teamId, setIsMemberTeam])

  React.useEffect(() => {
    setTeamRating(team?.ratingTotal || 0)
  }, [team?.ratingTotal, setTeamRating])

  const {data:teamLeaderName} = useQuery({
    queryKey:['user',{ id: team?.leaderUserId }],
    queryFn: () => utilsService.getByIdPublic(team?.leaderUserId || 'Лидер скрывается'),
    enabled: !!team?.leaderUserId,
  })

  return (
    <>
      {isLoading ? 
      <div className="flex h-40 items-center justify-center ">
           <SpinnerSize size={20}/>
      </div>
      :
      isMemberTeam === true ? (
      <section className="flex flex-col gap-5">
         <header className="flex items-center justify-between gap-5 text-[#1d2d44]">
         <Card className={`flex-1/2 flex w-full flex-wrap justify-center h-60 max-h-60 gap-4 bg-[${MAIN_COLOR}] p-5`}>
          <img
            src="/mug.jpg"
            className="w-40 h-40 rounded-2xl flex-shrink-0"
            alt="Команда"
          />

          <div className="flex flex-col items-start gap-5 flex-wrap">
            <CardTitle className="font-medium text-xl">Профиль команды</CardTitle>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-xs font-bold whitespace-nowrap">Название команды:</p>
                <p className="text-xs font-medium truncate min-w-0">{team?.name ?? "—"}</p>
              </div>

              <div className="flex items-center gap-2 min-w-0">
                <p className="text-xs font-bold whitespace-nowrap">Лидер команды:</p>
                <p className="text-xs font-medium truncate min-w-0">
                  {teamLeaderName?.name || teamLeaderName?.email || "—"}
                </p>
              </div>

              <div className="flex items-center gap-2 min-w-0">
                <p className="text-xs font-bold whitespace-nowrap">Дата создания:</p>
                <p className="text-xs font-medium truncate min-w-0">
                  {team?.createdAt ? formatDate(team.createdAt) : "—"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex-1/2 h-60 max-h-60 bg-[#C7D9E5] px-5 py-10">
          <CardTitle className="font-medium text-xl">Описание команды:</CardTitle>

          <CardDescription
            className="mt-2 max-h-60 overflow-y-auto pr-2 whitespace-pre-wrap break-words text-sm"
          >
              {team?.description}
          </CardDescription>
        </Card>

        {isTeamLeader && (
          <Card className="flex-1/8 min-h-60 max-h-80 flex items-center flex-col justify-evenly bg-[#C7D9E5] px-5">
            <ConfirmDialog
              trigger={<Trash2 className="w-12 h-12 cursor-pointer" />}
              title="Удалить команду?"
              description={
                <>
                  Вы точно хотите удалить команду <b>{team?.name ?? "—"}</b>?<br />
                  Это действие нельзя отменить.
                </>
              }
              cancelText="Отмена"
              confirmText="Удалить"
              confirmVariant="destructive"
              onConfirm={() => {
                TeamService.deleteTeam(team?.id || '')
              }}
            />

            <CreateTeamDialog
              mode="edit"
              teamId={team?.id}
              initialValues={{
                name: team?.name ?? "",
                description: team?.description ?? "",
              }}
              trigger={
                <button type="button" className="cursor-pointer">
                  <Pencil className="w-12 h-12" />
                </button>
              }
            />
          </Card>
        )}

        </header>
      <TableTeamProfile leaderOrAdminId={teamLeaderName?.id}  teamId={team?.id}/>
      <FooterTeamProfile/>
      {isTeamLeader && <JoinRequestsTeamProfile/>}
        </section>
      ) :  (
        <div className="border-2 border-[#1d2d44] rounded-2xl p-10 my-5">
          <h2 className="text-4xl font-semibold text-center text-[#1d2d44]">
            У вас пока что нет команды
          </h2>
          <p className="mt-3 text-center text-[#1d2d44] opacity-80">
            Вы можете вступить в существующую команду или создать свою. После модерации она станет публичной.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <CreateTeamDialog
              trigger={<Button>Создать команду</Button>}
            />
          </div>
        </div>
      )
      }
    </>
  )
}
