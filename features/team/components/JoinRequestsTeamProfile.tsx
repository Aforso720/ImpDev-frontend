"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, X } from "lucide-react"
import { MAIN_COLOR, CONTRAST_COLOR } from "@/lib/constants/colors.constants"
import { formatDate } from "@/lib/format-date"
import { TeamService } from "../team.service"
import { getInitials } from "@/lib/getInitials"
import { toast } from "sonner"

type JoinRequest = {
  id: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  userId: string
  user: { name: string | null; email: string; avatarUrl: string | null }
  createdAt: string
}

function statusBadge(status: JoinRequest["status"]) {
  if (status === "PENDING") return <Badge variant="secondary">Ожидает</Badge>
  if (status === "APPROVED") return <Badge>Принята</Badge>
  return <Badge variant="destructive">Отклонена</Badge>
}

export default function JoinRequestsTeamProfile() {
  const qc = useQueryClient()

  const {
    data: joinRequests,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["join-request", "team", "incoming"],
    queryFn: () => TeamService.getJoinRequest(),
  })

  const rows = (joinRequests as JoinRequest[] | undefined) ?? []

  const { mutate: approveMutate, isPending: isApprovePending, variables: approveVar } = useMutation({
    mutationKey: ["join-request", "approve"],
    mutationFn: (joinRequestId: string) => TeamService.approveJoinRequest(joinRequestId),
    onSuccess: async () => {
      toast.success("Заявка принята")
      await qc.invalidateQueries({ queryKey: ["join-request", "team", "incoming"] })
      // опционально: если у тебя где-то выводятся участники команды
      await qc.invalidateQueries({ queryKey: ["team", "members", "me"] })
    },
    onError: () => {
      toast.error("Не удалось принять заявку")
    },
  })

  const { mutate: rejectMutate, isPending: isRejectPending, variables: rejectVar } = useMutation({
    mutationKey: ["join-request", "reject"],
    mutationFn: (joinRequestId: string) => TeamService.rejectJoinRequest(joinRequestId),
    onSuccess: async () => {
      toast.success("Заявка отклонена")
      await qc.invalidateQueries({ queryKey: ["join-request", "team", "incoming"] })
    },
    onError: () => {
      toast.error("Не удалось отклонить заявку")
    },
  })

  return (
    <Card style={{ backgroundColor: MAIN_COLOR, color: CONTRAST_COLOR }} className="p-5">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl font-bold text-[#344966]">Заявки в команду:</CardTitle>
          <Badge variant="outline" className="border-[#344966] text-[#344966]">
            {rows.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-white/10 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-52" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-xl bg-white/10 p-4 text-sm">
            Не удалось загрузить заявки. Попробуйте обновить страницу.
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl bg-[#344966] p-4 text-sm text-[#C7D9E5] ">
            Сейчас нет заявок на вступление.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => {
              const display = r.user.name?.trim() ? r.user.name.trim() : r.user.email
              const approvingThis = isApprovePending && approveVar === r.id
              const rejectingThis = isRejectPending && rejectVar === r.id
              const anyPendingThis = approvingThis || rejectingThis

              return (
                <div key={r.id} className="rounded-xl bg-[#344966] p-4 text-[#C7D9E5]">
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={r.user.avatarUrl ?? undefined} alt={display} />
                      <AvatarFallback>{getInitials(display)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold">{display}</p>
                        {statusBadge(r.status)}
                      </div>
                      <p className="truncate text-xs opacity-80">{r.user.email}</p>
                      <p className="text-xs opacity-70">
                        Дата заявки: {r.createdAt ? formatDate(r.createdAt) : "—"}
                      </p>
                    </div>

                    {r.status === "PENDING" ? (
                      <div className="flex items-center gap-2 ">
                        <Button
                          size="sm"
                          className="gap-2 border-2 border-[#C7D9E5] cursor-pointer"
                          onClick={() => approveMutate(r.id)}
                          disabled={anyPendingThis}
                        >
                          <Check className="h-4 w-4" />
                          {approvingThis ? "Принимаем…" : "Принять"}
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-2 cursor-pointer"
                          onClick={() => rejectMutate(r.id)}
                          disabled={anyPendingThis}
                        >
                          <X className="h-4 w-4" />
                          {rejectingThis ? "Отклоняем…" : "Отклонить"}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
