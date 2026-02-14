"use client"

import {
  Bell,
  ChevronsUpDown,
  LogOut,
  Settings,
  User,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { authService } from "@/lib/services/auth.service"
import { userService } from "@/lib/services/user.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function NavUser() {
  const { isMobile } = useSidebar()
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => userService.getProfile(),
  })

  const { mutate: logoutMutate, isPending: isLogoutPending } = useMutation({
    mutationKey: ["logout"],
    mutationFn: () => authService.logout(),
    onSuccess: async () => {
      await queryClient.cancelQueries()
      queryClient.clear()
      router.replace("/auth")
      toast.success("Вы вышли из аккаунта")
    },
    onError: () => {
      queryClient.clear()
      router.replace("/auth")
      toast.error("Не удалось выйти корректно, но сессия очищена")
    },
  })

  const safeName = user?.name ?? "Пользователь"
  const safeEmail = user?.email ?? "—"
  const safeAvatar = user?.avatarUrl ?? ""

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              disabled={isLoading || isError}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={safeAvatar} alt={safeName} />
                <AvatarFallback className="rounded-lg">
                  {safeName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {isLoading ? "Загрузка…" : safeName}
                </span>
                <span className="truncate text-xs">
                  {isLoading ? "—" : safeEmail}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={safeAvatar} alt={safeName} />
                  <AvatarFallback className="rounded-lg">
                    {safeName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{safeName}</span>
                  <span className="truncate text-xs">{safeEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem disabled={isLoading || isError}>
                <User />
                Профиль
              </DropdownMenuItem>
              <DropdownMenuItem disabled={isLoading || isError}>
                <Settings />
                Настройки
              </DropdownMenuItem>
              <DropdownMenuItem disabled={isLoading || isError}>
                <Bell />
                Уведомления
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => logoutMutate()}
              disabled={isLogoutPending}
            >
              <LogOut />
              Выйти из аккаунта
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
