"use client"

import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { CourseService } from "@/features/course/course.service"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function NavProjects() {
  const { data, isLoading } = useQuery({
    queryKey: ["course", "public", { page: 1, limit: 5 }],
    queryFn: () => CourseService.getAvailable({ page: 1, limit: 5 }),
  })

  const projects = data?.items ?? []

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Быстрый доступ к курсам</SidebarGroupLabel>
      <SidebarMenu>
        {isLoading ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <span className="truncate">Загружаем список...</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : null}

        {projects.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild>
              <Link href={`/courses/${item.slug}`}>
                <span className="truncate">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}

        <SidebarMenuItem>
          <SidebarMenuButton asChild className="cursor-pointer text-sidebar-foreground/70">
            <Link href="/courses">
              <MoreHorizontal className="text-sidebar-foreground/70" />
              <span>Все курсы</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
