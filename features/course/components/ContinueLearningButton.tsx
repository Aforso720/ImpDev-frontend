import Link from "next/link"

import { Button } from "@/components/ui/button"

import type { AdaptivePlanItemView } from "../adaptive.types"
import { getLearningHref } from "../course-progress.helpers"

type ContinueLearningButtonProps = {
  slug: string
  item?: AdaptivePlanItemView | null
  label?: string
  className?: string
}

export function ContinueLearningButton({
  slug,
  item,
  label = "Продолжить",
  className,
}: ContinueLearningButtonProps) {
  return (
    <Button asChild className={className}>
      <Link href={getLearningHref(slug, item)}>{label}</Link>
    </Button>
  )
}
