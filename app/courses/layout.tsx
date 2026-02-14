import { SidebarLayout } from "@/features/ui/SidebarLayout";

export default function CoursesLayout({
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