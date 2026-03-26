"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname, useSearchParams } from "next/navigation"

function getTitleByRoute(pathname: string, status: string | null) {
  if (pathname === "/") return "Главная"

  if (pathname === "/courses") return "Курсы"
  if (pathname === "/courses/my") {
    if (status === "DRAFT") return "Черновики курсов"
    if (status === "PUBLISHED") return "Опубликованные курсы"
    if (status === "ARCHIVED") return "Архив курсов"
    return "Мои курсы"
  }
  if (pathname.startsWith("/courses/")) return "Карточка курса"

  if (pathname === "/team") return "Группы и сообщества"
  if (pathname === "/team/me") return "Моя команда"
  if (pathname === "/team/join-requests/incoming") return "Входящие заявки"

  if (pathname === "/university") return "Университеты"
  if (pathname === "/university/me") return "Мой университет"
  if (pathname.startsWith("/university/")) return "Профиль университета"

  if (pathname === "/teachers") return "Преподаватели"
  if (pathname === "/programs") return "Программы"
  if (pathname === "/analytics") return "Факты и аналитика"
  if (pathname === "/profile") return "Профиль"

  return "Главная"
}

export function PageHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const status = searchParams.get("status")
  const title = getTitleByRoute(pathname, status)

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Платформа Bayanum</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
