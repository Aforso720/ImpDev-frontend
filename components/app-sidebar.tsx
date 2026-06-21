"use client"

import Link from "next/link"
import * as React from "react"
import {
  BookOpen,
  BookOpenCheck,
  Building2,
  ClipboardCheck,
  ClipboardList,
  ShieldCheck,
  Users,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { canAccessTeacherPanel } from "@/features/teacher/teacher-access"
import { useTeacherCourses } from "@/features/teacher/hooks"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { data } from "@/lib/data"
import { userService } from "@/lib/services/user.service"

const teacherNavItems = [
  {
    title: "Панель преподавателя",
    url: "/teacher",
    icon: BookOpenCheck,
  },
  {
    title: "Мои курсы",
    url: "/teacher/courses",
    icon: BookOpenCheck,
  },
  {
    title: "Проверка практик",
    url: "/teacher/submissions",
    icon: ClipboardCheck,
  },
  {
    title: "Проверка тестов",
    url: "/teacher/assessments",
    icon: ClipboardList,
  },
]

const adminNavItems = [
  {
    title: "Админ-панель",
    url: "/admin",
    icon: ShieldCheck,
  },
  {
    title: "Пользователи",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Команды",
    url: "/admin/teams",
    icon: ShieldCheck,
  },
  {
    title: "Университеты",
    url: "/admin/universities",
    icon: Building2,
  },
  {
    title: "Курсы",
    url: "/admin/courses",
    icon: BookOpen,
  },
]

function SidebarBrand() {
  return (
    <div className="rounded-xl border border-sidebar-border/70 bg-sidebar-accent/30 p-3 text-sidebar-foreground">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <span className="text-base font-semibold">B</span>
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">Bayanum</p>
          <p className="truncate text-xs text-sidebar-foreground/70">Наука и образование региона</p>
        </div>
      </Link>

      {/* <div className="mt-3 rounded-lg bg-nuri-glow p-2 text-[11px] leading-relaxed text-[#5a3a12]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="font-medium">Nuri</span>
          <Badge variant="outline" className="border-[#c28f49]/50 bg-[#fff2df] px-1.5 py-0 text-[10px] text-[#7b4f17]">
            helper
          </Badge>
        </div>
        <p className="mt-1">Главная витрина помогает выбрать следующий шаг в экосистеме платформы.</p>
      </div> */}
    </div>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user } = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => userService.getProfile(),
  })

  const hasDirectTeacherAccess = canAccessTeacherPanel(user)
  const teacherCoursesQuery = useTeacherCourses({
    enabled: Boolean(user && !hasDirectTeacherAccess),
  })

  const showTeacherNav = canAccessTeacherPanel(
    user,
    (teacherCoursesQuery.data?.length ?? 0) > 0,
  )
  const showAdminNav = user?.role === "ADMIN"
  const navGroups = React.useMemo(
    () => [
      {
        title: "Обучение",
        items: data.navMain,
      },
      ...(showTeacherNav
        ? [
            {
              title: "Преподаватель",
              items: teacherNavItems,
            },
          ]
        : []),
      ...(showAdminNav
        ? [
            {
              title: "Администрирование",
              items: adminNavItems,
            },
          ]
        : []),
    ],
    [showAdminNav, showTeacherNav],
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarBrand />
        <NavMain groups={navGroups} />
      </SidebarHeader>

      <SidebarContent>
        <NavProjects />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
