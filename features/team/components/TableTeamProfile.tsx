"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontalIcon } from "lucide-react"
import { formatDate } from "@/lib/format-date"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ITeamMember } from "@/lib/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { TeamService } from "../team.service"
import { useTeamStore } from "../team.store"
import { getInitials } from "@/lib/getInitials"
import { toast } from "sonner"

function roleToRu(role: ITeamMember["role"]) {
  switch (role) {
    case "ADMIN":
      return "Администратор"
    case "USER":
      return "Участник"
    default:
      return role
  }
}

export function TableTeamProfile({
  leaderOrAdminId,
  teamId,
}: {
  leaderOrAdminId?: string
  teamId?: string
}) {
  const qc = useQueryClient()

  const { data: members } = useQuery({
    queryKey: ["team", "members", "me"],
    queryFn: () => TeamService.getTeamMembers(),
  })

  const setTeamMembers = useTeamStore((state) => state.setTeamMembers)
  const isTeamLeader = useTeamStore((state) => state.isTeamLeader)
  const setIsTeamLeader = useTeamStore((state) => state.setIsTeamLeader)
  const setTopInRatingMember = useTeamStore((state) => state.setTopInRatingMember)

  React.useEffect(() => {
    setTeamMembers(members?.length ?? 0)
    
  }, [members?.length, setTeamMembers])

  const rows = members ?? []
  const memberAdmin = members?.find((item) => item.role === "ADMIN")

  React.useEffect(() => {
  setIsTeamLeader(leaderOrAdminId === memberAdmin?.id)

  const topRating =
    members?.reduce((max, item) => {
      const r = typeof (item as any).ratingTotal === "number" ? (item as ITeamMember).ratingTotal : 0
      return r > max ? r : max
    }, 0) ?? 0

  setTopInRatingMember(topRating)
}, [leaderOrAdminId, memberAdmin?.id, setIsTeamLeader, members, setTopInRatingMember])


  const colCount = isTeamLeader ? 5 : 4

  const [deletingUserId, setDeletingUserId] = React.useState<string | null>(null)

  const { mutate: deleteMember, isPending } = useMutation({
    mutationKey: ["member", "delete"],
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      TeamService.deleteTeamMember(teamId, userId),
    onMutate: ({ userId }) => {
      setDeletingUserId(userId)
    },
    onSuccess: () => {
      toast.success("Участник удалён")
      qc.invalidateQueries({ queryKey: ["team", "members", "me"] })
    },
    onError: () => {
      toast.error("Не удалось удалить участника")
    },
    onSettled: () => {
      setDeletingUserId(null)
    },
  })

  function handleDelete(userId: string) {
    if (!teamId) {
      toast.error("Не удалось определить teamId")
      return
    }
    deleteMember({ teamId, userId })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Участник</TableHead>
          <TableHead>Роль</TableHead>
          <TableHead>Рейтинг</TableHead>
          <TableHead>Дата вступления</TableHead>
          {isTeamLeader ? <TableHead className="text-right" /> : null}
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={colCount} className="text-muted-foreground">
              Участников пока нет
            </TableCell>
          </TableRow>
        ) : (
          rows.map((m) => {
            const displayName = m.name?.trim() ? m.name.trim() : m.email
            const isAdmin = m.role === "ADMIN"
            const canDelete = isTeamLeader && !isAdmin

            return (
              <TableRow key={m.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={m.avatarUrl ?? undefined} alt={displayName} />
                      <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>{roleToRu(m.role)}</TableCell>

                <TableCell className="whitespace-nowrap">
                  {"ratingTotal" in m && typeof (m as any).ratingTotal === "number"
                    ? (m as any).ratingTotal
                    : 0}
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  {m.createdAt ? formatDate(m.createdAt) : "—"}
                </TableCell>

                {isTeamLeader ? (
                  <TableCell className="text-right">
                    {!isAdmin ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            disabled={!canDelete || (isPending && deletingUserId === m.id)}
                            title="Действия"
                          >
                            <MoreHorizontalIcon />
                            <span className="sr-only">Открыть меню</span>
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={(e) => {
                              e.preventDefault()
                              handleDelete(m.id)
                            }}
                            disabled={!canDelete || (isPending && deletingUserId === m.id)}
                          >
                            Удалить участника
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </TableCell>
                ) : null}
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
