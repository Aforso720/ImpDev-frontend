import type { AdaptivePlanItemView, AdaptivePlanView } from "./adaptive.types"

export type CourseProgressSummary = {
  totalBlocks: number
  completedBlocks: number
  remainingBlocks: number
  percent: number
  currentItem: AdaptivePlanItemView | null
  nextItem: AdaptivePlanItemView | null
  previousItem: AdaptivePlanItemView | null
}

const doneStatuses = new Set<AdaptivePlanItemView["status"]>(["DONE", "SKIPPED", "CANCELLED"])
const openStatuses = new Set<AdaptivePlanItemView["status"]>(["PLANNED", "IN_PROGRESS", "MISSED"])

export function isDonePlanItem(item: AdaptivePlanItemView) {
  return doneStatuses.has(item.status)
}

export function isOpenPlanItem(item: AdaptivePlanItemView) {
  return openStatuses.has(item.status)
}

export function isBlockAvailable(item: AdaptivePlanItemView) {
  return item.itemType === "BLOCK" && !item.locked && item.status !== "CANCELLED"
}

export function getPlanBlockItems(plan: AdaptivePlanView | null | undefined) {
  return sortPlanItems((plan?.items ?? []).filter((item) => item.itemType === "BLOCK"))
}

export function getCompletedBlockItems(plan: AdaptivePlanView | null | undefined) {
  return getPlanBlockItems(plan).filter(isDonePlanItem)
}

export function getAvailableBlockItems(plan: AdaptivePlanView | null | undefined) {
  return getPlanBlockItems(plan).filter((item) => isBlockAvailable(item) && isOpenPlanItem(item))
}

export function getCurrentBlockItem(plan: AdaptivePlanView | null | undefined, blockId?: string) {
  const blocks = getPlanBlockItems(plan)

  if (blockId) {
    const directItem = blocks.find((item) => item.blockId === blockId || item.id === blockId) ?? null
    return directItem && isBlockAvailable(directItem) ? directItem : null
  }

  return (
    blocks.find((item) => item.status === "IN_PROGRESS" && isBlockAvailable(item)) ??
    getAvailableBlockItems(plan)[0] ??
    blocks.find(isBlockAvailable) ??
    null
  )
}

export function getNextBlockItem(
  plan: AdaptivePlanView | null | undefined,
  currentItem: AdaptivePlanItemView | null | undefined,
) {
  const blocks = getPlanBlockItems(plan)
  if (!currentItem) return blocks.find(isOpenPlanItem) ?? blocks[0] ?? null

  const currentIndex = blocks.findIndex((item) => item.id === currentItem.id)
  if (currentIndex < 0) return null

  return blocks.slice(currentIndex + 1).find(isBlockAvailable) ?? null
}

export function getPreviousBlockItem(
  plan: AdaptivePlanView | null | undefined,
  currentItem: AdaptivePlanItemView | null | undefined,
) {
  const blocks = getPlanBlockItems(plan)
  if (!currentItem) return null

  const currentIndex = blocks.findIndex((item) => item.id === currentItem.id)
  if (currentIndex <= 0) return null

  return blocks.slice(0, currentIndex).reverse().find(isBlockAvailable) ?? null
}

export function calculateCourseProgress(plan: AdaptivePlanView | null | undefined): CourseProgressSummary {
  const blocks = getPlanBlockItems(plan)
  const completed = blocks.filter(isDonePlanItem)
  const open = blocks.filter(isOpenPlanItem)
  const currentItem = getCurrentBlockItem(plan)

  return {
    totalBlocks: blocks.length,
    completedBlocks: completed.length,
    remainingBlocks: open.length,
    percent: blocks.length > 0 ? Math.round((completed.length / blocks.length) * 100) : 0,
    currentItem,
    nextItem: getNextBlockItem(plan, currentItem),
    previousItem: getPreviousBlockItem(plan, currentItem),
  }
}

export function isCourseCompleted(plan: AdaptivePlanView | null | undefined) {
  const blocks = getPlanBlockItems(plan)
  return blocks.length > 0 && blocks.every(isDonePlanItem)
}

export function willCompleteCourse(
  plan: AdaptivePlanView | null | undefined,
  currentItem: AdaptivePlanItemView | null | undefined,
) {
  if (!currentItem || isDonePlanItem(currentItem)) return isCourseCompleted(plan)

  const blocks = getPlanBlockItems(plan)
  if (blocks.length === 0) return false

  return blocks.every((item) => item.id === currentItem.id || isDonePlanItem(item))
}

export function getLearningHref(slug: string, item?: AdaptivePlanItemView | null) {
  const itemId = item?.blockId ?? item?.id
  return itemId ? `/courses/${slug}/learn/${itemId}` : `/courses/${slug}/learn`
}

function sortPlanItems(items: AdaptivePlanItemView[]) {
  return items
    .map((item, index) => ({ item, index }))
    .sort((leftEntry, rightEntry) => {
      const left = leftEntry.item
      const right = rightEntry.item
      const leftTime = left.scheduledStart ? new Date(left.scheduledStart).getTime() : Number.MAX_SAFE_INTEGER
      const rightTime = right.scheduledStart ? new Date(right.scheduledStart).getTime() : Number.MAX_SAFE_INTEGER

      if (leftTime !== rightTime) return leftTime - rightTime
      if (left.priority !== right.priority) return right.priority - left.priority

      return leftEntry.index - rightEntry.index
    })
    .map((entry) => entry.item)
}
