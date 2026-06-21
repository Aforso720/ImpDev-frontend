import Link from "next/link"
import { CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { AdaptivePlanItemView, AdaptivePlanView } from "../adaptive.types"
import { getLearningHref, getPlanBlockItems, isBlockAvailable, isDonePlanItem } from "../course-progress.helpers"

type LearningSidebarProps = {
  slug: string
  plan: AdaptivePlanView | null
  currentItem: AdaptivePlanItemView | null
  compact?: boolean
}

function statusIcon(item: AdaptivePlanItemView, active: boolean) {
  if (!isBlockAvailable(item)) return <Lock className="h-4 w-4" />
  if (isDonePlanItem(item)) return <CheckCircle2 className="h-4 w-4 text-success" />
  if (active) return <PlayCircle className="h-4 w-4 text-action" />
  return <Circle className="h-4 w-4" />
}

export function LearningSidebar({ slug, plan, currentItem, compact = false }: LearningSidebarProps) {
  const items = getPlanBlockItems(plan)

  return (
    <Card className={cn("border-border bg-card text-card-foreground", compact && "border-0 shadow-none")}>
      <CardHeader className={compact ? "px-0 pt-0" : undefined}>
        <CardTitle className="text-base">Маршрут курса</CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-2", compact && "px-0 pb-0")}>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            План пока не содержит учебных блоков.
          </div>
        ) : (
          items.map((item, index) => {
            const active = item.id === currentItem?.id
            const available = isBlockAvailable(item)

            const splitPart = item.splitPart ?? 1
            const splitTotal = item.splitTotal ?? 1

            const content = (
              <div
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition",
                  active
                    ? "border-action/40 bg-card shadow-sm ring-1 ring-action/25"
                    : "border-transparent bg-muted/45 hover:border-border hover:bg-card",
                  !available && "opacity-60",
                )}
              >
                <span className="mt-0.5">{statusIcon(item, active)}</span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 font-medium text-foreground">
                    {item.title || `Блок ${index + 1}`}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="secondary">{item.expectedMinutes} мин</Badge>
                    {splitTotal > 1 ? (
                      <Badge variant="outline">
                        {splitPart}/{splitTotal}
                      </Badge>
                    ) : null}
                  </span>
                </span>
              </div>
            )

            return available ? (
              <Link key={item.id} href={getLearningHref(slug, item)}>
                {content}
              </Link>
            ) : (
              <div key={item.id}>{content}</div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
