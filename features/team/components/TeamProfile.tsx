'use client'

import React from "react"
import { Pencil, Trash2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/confrim-dialog"
import { SpinnerSize } from "@/components/ui/spinner-size"
import { MAIN_COLOR } from "@/lib/constants/colors.constants"
import { formatDate } from "@/lib/format-date"
import { userService } from "@/lib/services/user.service"
import { utilsService } from "@/lib/services/utils.service"

import { useTeamStore } from "../team.store"
import { TeamService } from "../team.service"
import { CreateTeamDialog } from "./CreateTeamDialog"
import FooterTeamProfile from "./FooterTeamProfile"
import JoinRequestsTeamProfile from "./JoinRequestsTeamProfile"
import { TableTeamProfile } from "./TableTeamProfile"

export const TeamProfile = () => {
  const isMemberTeam = useTeamStore((s) => s.isMemberTeam)
  const setIsMemberTeam = useTeamStore((s) => s.setIsMemberTeam)
  const setTeamRating = useTeamStore((s) => s.setTeamRating)
  const isTeamLeader = useTeamStore((state) => state.isTeamLeader)

  const { data: team } = useQuery({
    queryKey: ["team", "me"],
    queryFn: () => TeamService.getMeTeam(),
    enabled: isMemberTeam,
  })

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => userService.getProfile(),
  })

  React.useEffect(() => {
    if (!user) return
    setIsMemberTeam(!!user.teamId)
  }, [user?.teamId, setIsMemberTeam, user])

  React.useEffect(() => {
    setTeamRating(team?.ratingTotal || 0)
  }, [team?.ratingTotal, setTeamRating])

  const { data: teamLeaderName } = useQuery({
    queryKey: ["user", { id: team?.leaderUserId }],
    queryFn: () => utilsService.getByIdPublic(team?.leaderUserId || ""),
    enabled: !!team?.leaderUserId,
  })

  return (
    <>
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <SpinnerSize size={20} />
        </div>
      ) : isMemberTeam === true ? (
        <section className="flex flex-col gap-5">
          <header className="flex items-center justify-between gap-5 text-ink-inverse">
            <Card
              style={{ backgroundColor: MAIN_COLOR }}
              className="flex h-60 max-h-60 w-full flex-1/2 flex-wrap justify-center gap-4 p-5 text-ink-inverse"
            >
              <img src="/mug.jpg" className="h-40 w-40 flex-shrink-0 rounded-2xl" alt="Команда" />

              <div className="flex flex-col items-start gap-5 flex-wrap">
                <CardTitle className="text-xl font-medium text-ink-inverse">Профиль команды</CardTitle>

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

            <Card
              style={{ backgroundColor: MAIN_COLOR }}
              className="h-60 max-h-60 flex-1/2 px-5 py-10 text-ink-inverse"
            >
              <CardTitle className="text-xl font-medium text-ink-inverse">Описание команды:</CardTitle>

              <CardDescription className="mt-2 max-h-60 overflow-y-auto pr-2 whitespace-pre-wrap break-words text-sm text-ink-inverse/80">
                {team?.description}
              </CardDescription>
            </Card>

            {isTeamLeader && (
              <Card
                style={{ backgroundColor: MAIN_COLOR }}
                className="flex min-h-60 max-h-80 flex-1/8 flex-col items-center justify-evenly px-5 text-ink-inverse"
              >
                <ConfirmDialog
                  trigger={<Trash2 className="w-12 h-12 cursor-pointer" />}
                  title="Удалить команду?"
                  description={
                    <>
                      Вы точно хотите удалить команду <b>{team?.name ?? "—"}</b>?
                      <br />
                      Это действие нельзя отменить.
                    </>
                  }
                  cancelText="Отмена"
                  confirmText="Удалить"
                  confirmVariant="destructive"
                  onConfirm={() => {
                    TeamService.deleteTeam(team?.id || "")
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

          <TableTeamProfile leaderOrAdminId={teamLeaderName?.id} teamId={team?.id} />
          <FooterTeamProfile />
          {isTeamLeader && <JoinRequestsTeamProfile />}
        </section>
      ) : (
        <div className="my-5 rounded-2xl border-2 border-brand-soft p-10">
          <h2 className="text-center text-4xl font-semibold text-ink-strong">
            У вас пока что нет команды
          </h2>
          <p className="mt-3 text-center text-ink-soft">
            Вы можете вступить в существующую команду или создать свою. После модерации она станет
            публичной.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <CreateTeamDialog trigger={<Button>Создать команду</Button>} />
          </div>
        </div>
      )}
    </>
  )
}
