"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Command,
  Frame,
  GalleryVerticalEnd,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Users,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Заглушечные данные (позже подставишь из API)
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  // В твоём проекте “переключатель” можно трактовать как:
  // - Команда пользователя (Team)
  // - Университет пользователя (University)
  // Оставляю заглушки, но названия сделал “по смыслу”
  teams: [
    {
      name: "ImpDev",
      logo: GalleryVerticalEnd,
      plan: "Команда",
    },
    {
      name: "Университет: Demo University",
      logo: AudioWaveform,
      plan: "Университет",
    },
    {
      name: "Без привязки",
      logo: Command,
      plan: "Публичный доступ",
    },
  ],

  // Основная навигация под MVP:
  // - Дашборд
  // - Курсы (публичные/университетские/командные + мои черновики)
  // - Команда (моя команда, заявки)
  // - Университет (мой университет)
  // - Профиль/настройки
  // - Админка (если роль ADMIN — потом можно условно скрывать)
  navMain: [
    {
      title: "Главная",
      url: "/",
      icon: LayoutDashboard,
      isActive: true,
    },

    {
      title: "Курсы",
      url: "/courses",
      icon: BookOpen,
      items: [
        { title: "Все доступные", url: "/courses" },
        { title: "Мои курсы", url: "/courses/my" },
        { title: "Черновики", url: "/courses/my?status=DRAFT" },
        { title: "Опубликованные", url: "/courses/my?status=PUBLISHED" },
        // { title: "Архив", url: "/courses/my?status=ARCHIVED" }, // можешь включить позже
      ],
    },

    {
      title: "Команда",
      url: "/team",
      icon: Users,
      items: [
        { title: "Моя команда", url: "/team/me" },
        { title: "Все команды", url: "/team" },
        { title: "Входящие заявки", url: "/team/join-requests/incoming" },
        // { title: "Создать команду", url: "/team/create" }, // если будет отдельная страница
      ],
    },

    {
      title: "Университет",
      url: "/university",
      icon: GraduationCap,
      items: [
        { title: "Мой университет", url: "/university/me" },
        { title: "Список университетов", url: "/university" },
        // { title: "Создать университет", url: "/university/create" }, // если сделаешь UI для админа
      ],
    },

    {
      title: "Администрирование",
      url: "/admin",
      icon: ShieldCheck,
      items: [
        { title: "Пользователи", url: "/admin/users" },
        { title: "Модерация команд", url: "/admin/team" },
        // { title: "Университеты", url: "/admin/university" }, // если добавишь эндпоинты/страницу
      ],
    },
  ],

  projects: [
    { name: "Курс по NEST", url: "/courses/my?status=DRAFT", icon: Frame },
    { name: "Курс по HTML", url: "/team/join-requests/incoming", icon: SquareTerminal },
    { name: "С нуля до профи CSS", url: "/admin/users", icon: SquareTerminal },
  ],
}



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <NavMain items={data.navMain} />
      </SidebarHeader>

      <SidebarContent>

        {/* Сейчас можно выключить как “необязательный” блок */}
        <NavProjects projects={data.projects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
