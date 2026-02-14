"use client"

import { useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { InputInline } from "@/components/ui/inputInline"
import { MAIN_COLOR } from "@/lib/constants/colors.constants"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { TeamService } from "../team.service"
import { formatDate } from "@/lib/format-date"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/getInitials"
import { Button } from "@/components/ui/button"
import { SpinnerSize } from "@/components/ui/spinner-size"
import { useTeamStore } from "../team.store"
import { toast } from "sonner"

const TeamSearchBlock = () => {
  const [query, setQuery] = useState("")
  const qc = useQueryClient()

  const [sent, setSent] = useState<Record<string, true>>({})

  const { data: filtered, isLoading, isError } = useQuery({
    queryKey: ["teams", "all"],
    queryFn: () => TeamService.getAllTeams(),
  })

  const teams = filtered ?? []
  const visibleTeams =
    query.trim().length === 0
      ? teams
      : teams.filter((t) => {
          const hay = `${t.name} ${t.description ?? ""}`.toLowerCase()
          return hay.includes(query.trim().toLowerCase())
        })

  const isMemberTeam = useTeamStore((state) => state.isMemberTeam)

  const { mutate: joinMutate, isPending: isJoinPending, variables } = useMutation({
    mutationKey: ["team", "join-request"],
    mutationFn: (teamId: string) => TeamService.sendJoinRequest(teamId),
    onSuccess: async (_data, teamId) => {
      setSent((prev) => ({ ...prev, [teamId]: true })) 
      toast.success("Заявка на вступление отправлена")
      await qc.invalidateQueries({ queryKey: ["teams", "all"] })
    },
    onError: () => {
      toast.error("Не удалось отправить заявку")
    },
  })

  return (
    <Card className={`bg-[${MAIN_COLOR}] mt-10 p-5 mb-5`}>
      <header className="flex items-center justify-between">
        <CardTitle className="text-2xl flex-1">Список всех команд</CardTitle>
        <InputInline value={query} onChange={setQuery} />
      </header>

      <section className="flex flex-col gap-3">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center ">
            <SpinnerSize size={10} />
          </div>
        ) : isError ? (
          <div className="text-sm text-destructive">Не удалось загрузить список команд</div>
        ) : visibleTeams?.length === 0 ? (
          <div className="text-xl text-center text-[#1d2d44]">Не удалось найти , может быть , создадите сами?</div>
        ) : (
          visibleTeams?.map((team) => {
            const pendingThis = isJoinPending && variables === team.id
            const alreadySent = !!sent[team.id]

            return (
              <Card key={team.id} className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={team.avatarUrl ?? undefined} alt={team.name} />
                    <AvatarFallback>{getInitials(team.name)}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{team.name}</p>

                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {team.description || "Без описания"}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Участников: {team._count?.users ?? 0}</span>
                      <span>Создана: {team.createdAt ? formatDate(team.createdAt) : "—"}</span>
                    </div>
                  </div>

                  {!isMemberTeam && (
                    <Button
                      size="lg"
                      className="shrink-0"
                      variant={alreadySent ? "secondary" : "default"}
                      disabled={pendingThis || alreadySent}
                      onClick={() => joinMutate(team.id)}
                    >
                      {pendingThis ? "Отправляем…" : alreadySent ? "Заявка отправлена" : "Вступить"}
                    </Button>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </section>
    </Card>
  )
}

export default TeamSearchBlock
