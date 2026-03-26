"use client"

import Link from "next/link"
import { type LucideIcon } from "lucide-react"
import {
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

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  
  function isItemActive(pathname: string, itemUrl: string) {
    if (itemUrl === "/") return pathname === "/"
    return pathname === itemUrl || pathname.startsWith(itemUrl + "/")
  }
  return (
    <SidebarMenu>
      {items.map((item) => {
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
