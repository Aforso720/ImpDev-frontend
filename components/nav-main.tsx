"use client"

import Link from "next/link"
import { type LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}

export type NavGroup = {
  title: string
  items: NavItem[]
}

export function NavMain({ items, groups }: { items?: NavItem[]; groups?: NavGroup[] }) {
  const pathname = usePathname()
  
  function isItemActive(pathname: string, itemUrl: string) {
    if (itemUrl === "/") return pathname === "/"
    return pathname === itemUrl || pathname.startsWith(itemUrl + "/")
  }

  function renderMenu(menuItems: NavItem[]) {
    return (
    <SidebarMenu>
      {menuItems.map((item) => {
        const active = isItemActive(pathname, item.url)

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={active}>
              <Link href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
    )
  }

  if (groups?.length) {
    return (
      <>
        {groups.map((group) => (
          <SidebarGroup key={group.title} className="py-1">
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>{renderMenu(group.items)}</SidebarGroupContent>
          </SidebarGroup>
        ))}
      </>
    )
  }

  return (
    renderMenu(items ?? [])
  )
}
