"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname, useSearchParams } from "next/navigation";

function getTitleByRoute(pathname: string, status: string | null) {
  switch (pathname) {
    case "/":
      return "Главная";

    // Courses
    case "/courses":
      return "Курсы";

    case "/courses/my": {
      switch (status) {
        case "DRAFT":
          return "Черновики";
        case "PUBLISHED":
          return "Опубликованные";
        case "ARCHIVED":
          return "Архив";
        default:
          return "Мои курсы";
      }
    }

    // Team
    case "/team":
      return "Команда";
    case "/team/me":
      return "Моя команда";
    case "/team/join-requests/incoming":
      return "Входящие заявки";

    // University
    case "/university":
      return "Университет";
    case "/university/me":
      return "Мой университет";

    // Admin / Manager
    // case "/manager":
    //   return "Администрирование";
    case "/admin/users":
      return "Пользователи";
    case "/admin/team":
      return "Модерация команд";

    default:
      return "Главная";
  }
}

export function PageHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const title = getTitleByRoute(pathname, status);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Платформа обучения</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator className="hidden md:block" />

            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
