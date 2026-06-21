import { BookOpen, Frame, GraduationCap, LayoutDashboard, Newspaper, Settings2, ShieldCheck, User, Users } from "lucide-react"

export const data = {
  navMain: [
    {
      title: "Главная",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Университеты",
      url: "/university",
      icon: GraduationCap,
    },
    {
      title: "Курсы",
      url: "/courses",
      icon: BookOpen,
    },
    {
      title: "Задачи и экзамены",
      url: "/challenges",
      icon: ShieldCheck,
    },
    {
      title: "Сообщества",
      url: "/team",
      icon: Users,
    },
    {
      title: "Лента",
      url: "/community",
      icon: Newspaper,
    },
    // {
    //   title: "Преподаватели",
    //   url: "/teachers",
    //   icon: Settings2,
    // },
    // {
    //   title: "Программы",
    //   url: "/programs",
    //   icon: Frame,
    // },
    // {
    //   title: "Факты / Аналитика",
    //   url: "/analytics",
    //   icon: ShieldCheck,
    // },
    // {
    //   title: "Профиль",
    //   url: "/profile",
    //   icon: User,
    // },
  ],
}

