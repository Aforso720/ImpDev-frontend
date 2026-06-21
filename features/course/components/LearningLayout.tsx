import type { ReactNode } from "react"
import { ListTree } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import type { AdaptivePlanItemView, AdaptivePlanView } from "../adaptive.types"
import { isCourseCompleted, type CourseProgressSummary } from "../course-progress.helpers"
import type { CourseDetail } from "../course.types"
import { LearningProgressHeader } from "./LearningProgressHeader"
import { LearningSidebar } from "./LearningSidebar"

type LearningLayoutProps = {
  course: CourseDetail
  plan: AdaptivePlanView | null
  currentItem: AdaptivePlanItemView | null
  progress: CourseProgressSummary
  children: ReactNode
  navigation: ReactNode
}

export function LearningLayout({
  course,
  plan,
  currentItem,
  progress,
  children,
  navigation,
}: LearningLayoutProps) {
  const completed = isCourseCompleted(plan)

  return (
    <section className="space-y-4">
      <LearningProgressHeader
        courseTitle={course.title}
        progress={progress}
        currentItem={currentItem}
        completed={completed}
      />

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <ListTree className="h-4 w-4" />
              Открыть структуру курса
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[88vw] overflow-y-auto p-0 sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Структура курса</SheetTitle>
              <SheetDescription>Выберите блок маршрута для прохождения.</SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-4">
              <LearningSidebar slug={course.slug} plan={plan} currentItem={currentItem} compact />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block lg:sticky lg:top-4 lg:self-start">
          <LearningSidebar slug={course.slug} plan={plan} currentItem={currentItem} />
        </div>
        <div className="space-y-4">
          {children}
          {navigation}
        </div>
      </div>
    </section>
  )
}
