import { SidebarLayout } from "@/features/ui/SidebarLayout";

export default function TeamLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>){
    return(
       <SidebarLayout>
            {children}
       </SidebarLayout>
    )
} 