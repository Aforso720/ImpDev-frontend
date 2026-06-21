export type AdaptiveRouteMode = "STRICT" | "ADAPTIVE" | "RECOVERY"
export type AdaptivePlanScope = "DAY" | "WEEK"
export type AdaptivePlanStatus = "DRAFT" | "ACTIVE" | "SUPERSEDED"
export type AdaptivePlanItemType = "BLOCK" | "WORKFLOW_STAGE" | "BUFFER"
export type AdaptivePlanItemStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "DONE"
  | "SKIPPED"
  | "MISSED"
  | "CANCELLED"

export type AdaptiveProgressEventType =
  | "PLAN_GENERATED"
  | "BLOCK_STARTED"
  | "BLOCK_COMPLETED"
  | "BLOCK_SKIPPED"
  | "WORKFLOW_SUBMITTED"
  | "WORKFLOW_REVIEWED"
  | "REWORK_REQUESTED"
  | "DEFENSE_COMPLETED"
  | "PLAN_REPLANNED"

export type AdaptiveAvailabilityPreset =
  | "ONSITE_FIXED"
  | "SELF_PACED_DAILY"
  | "EVENING_FOCUSED"
  | "CUSTOM"

export type AdaptiveEnrollmentView = {
  id: string
  courseEnrollment: {
    id: string
    courseId: string
    userId: string
  }
  routeMode: AdaptiveRouteMode
  timezone: string
  planHorizonDays: number
  recoveryEnabled: boolean
}

export type AdaptivePlanItemView = {
  id: string
  itemType: AdaptivePlanItemType
  status: AdaptivePlanItemStatus
  blockId: string | null
  workflowStageInstanceId: string | null
  title: string | null
  scheduledStart: string | null
  scheduledEnd: string | null
  expectedMinutes: number
  priority: number
  locked: boolean
  source?: string | null
  notes?: string | null
  splitPart?: number
  splitTotal?: number
}

export type AdaptivePlanView = {
  id: string
  adaptiveEnrollmentId: string
  scope: AdaptivePlanScope
  dateStart: string
  dateEnd: string
  mode: AdaptiveRouteMode
  status: AdaptivePlanStatus
  version: number
  generationReason: string | null
  items: AdaptivePlanItemView[]
}

export type AdaptivePlansResponse = AdaptivePlanView[]

export type IntakeRequest = {
  routeMode: AdaptiveRouteMode
  timezone: string
  targetEndAt?: string
  planHorizonDays?: number
  strictSlotsOnly?: boolean
  learningContext: {
    roleContext: string
    baselineLevel?: string
    goals?: string[]
    constraints?: Record<string, unknown>
    deadlineAt?: string
  }
  availability: {
    presetType: AdaptiveAvailabilityPreset
    dailyMinutes?: number
    weekPattern?: Record<string, unknown>
    fixedSessions?: Array<{
      weekday: number
      start: string
      end: string
    }>
    maxCognitiveLoad?: number
  }
}

export type GeneratePlanRequest = {
  adaptiveEnrollmentId: string
  scope: AdaptivePlanScope
  dateStart: string
}

export type ReplanRequest = {
  adaptiveEnrollmentId: string
  trigger:
    | "MISSED_SLOT"
    | "MISSED_DEADLINE"
    | "LATE_REVIEW"
    | "AVAILABILITY_CHANGED"
    | "MANUAL_OVERRIDE"
  referenceDate: string
  modeOverride?: AdaptiveRouteMode
}

export type RecoveryStartRequest = {
  triggerReason: string
  debtMinutes?: number
  strategy?: Record<string, unknown>
}

export type ProgressEventRequest = {
  adaptiveEnrollmentId: string
  eventType: AdaptiveProgressEventType
  blockId?: string
  planItemId?: string
  workflowStageInstanceId?: string
  payload?: Record<string, unknown>
  occurredAt?: string
  idempotencyKey?: string
}

export type AdaptiveCourseState = {
  courseId: string
  adaptiveReady: boolean
  enrolled: boolean
  courseEnrollmentId: string | null
  adaptiveEnrollmentId: string | null
  routeMode: AdaptiveRouteMode | null
  hasCurrentPlan: boolean
  currentPlanMode: AdaptiveRouteMode | null
  currentPlanItems: number
}
