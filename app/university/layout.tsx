import { SidebarLayout } from "@/features/ui/SidebarLayout";

export default function UniversityLayout({
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