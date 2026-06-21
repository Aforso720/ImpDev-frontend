"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Play,
  RefreshCcw,
  ShieldAlert,
  SkipForward,
  Sparkles,
  Target,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import { AdaptiveService } from "../adaptive.service"
import type {
  AdaptiveAvailabilityPreset,
  AdaptiveCourseState,
  AdaptivePlanItemView,
  AdaptiveRouteMode,
  IntakeRequest,
  ProgressEventRequest,
} from "../adaptive.types"
import { CourseService } from "../course.service"

type Props = { courseId: string; focusModeDefault?: boolean }

function todayIsoLocal() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function parseError(error: unknown) {
  const data = error as { message?: string; response?: { data?: { message?: string | string[] } } }
  if (Array.isArray(data?.response?.data?.message)) return data.response.data.message.join(", ")
  if (typeof data?.response?.data?.message === "string") return data.response.data.message
  if (error instanceof Error) return error.message
  return "Не удалось выполнить действие"
}

function modeLabel(mode: AdaptiveRouteMode | null | undefined) {
  if (mode === "STRICT") return "Строгий ритм"
  if (mode === "ADAPTIVE") return "Персональный маршрут"
  if (mode === "RECOVERY") return "Восстановление темпа"
  return "Маршрут не выбран"
}

function statusLabel(status: AdaptivePlanItemView["status"]) {
  if (status === "PLANNED") return "Запланировано"
  if (status === "IN_PROGRESS") return "В процессе"
  if (status === "DONE") return "Выполнено"
  if (status === "SKIPPED") return "Пропущено"
  if (status === "MISSED") return "Просрочено"
  return "Отменено"
}

function itemTypeLabel(itemType: AdaptivePlanItemView["itemType"]) {
  if (itemType === "BLOCK") return "Учебный блок"
  if (itemType === "WORKFLOW_STAGE") return "Этап проверки"
  return "Буфер времени"
}

function formatPlanTime(value: string | null) {
  if (!value) return "Время уточняется"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Время уточняется"
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function isOpenStatus(status: AdaptivePlanItemView["status"]) {
  return status === "PLANNED" || status === "IN_PROGRESS" || status === "MISSED"
}

function isDoneStatus(status: AdaptivePlanItemView["status"]) {
  return status === "DONE" || status === "SKIPPED" || status === "CANCELLED"
}

function fallbackState(courseId: string): AdaptiveCourseState {
  return {
    courseId,
    adaptiveReady: false,
    enrolled: false,
    courseEnrollmentId: null,
    adaptiveEnrollmentId: null,
    routeMode: null,
    hasCurrentPlan: false,
    currentPlanMode: null,
    currentPlanItems: 0,
  }
}

export function CourseAdaptivePanel({ courseId, focusModeDefault = true }: Props) {
  const qc = useQueryClient()
  const [focusMode, setFocusMode] = useState(focusModeDefault)
  const [advanced, setAdvanced] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"OPEN" | "DONE" | "ALL">("OPEN")

  const [routeMode, setRouteMode] = useState<AdaptiveRouteMode>("ADAPTIVE")
  const [presetType, setPresetType] = useState<AdaptiveAvailabilityPreset>("SELF_PACED_DAILY")
  const [dailyMinutes, setDailyMinutes] = useState("30")
  const [horizonDays, setHorizonDays] = useState("7")
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Moscow")
  const [maxLoad, setMaxLoad] = useState("4")
  const [strictSlotsOnly, setStrictSlotsOnly] = useState(false)
  const [roleContext, setRoleContext] = useState("Самостоятельный пользователь")

  const stateQuery = useQuery({
    queryKey: ["adaptive", "course-state", courseId],
    queryFn: async () => {
      const rows = await AdaptiveService.getCourseStates([courseId])
      return rows[0] ?? fallbackState(courseId)
    },
    enabled: Boolean(courseId),
  })

  const state = stateQuery.data
  const adaptiveEnrollmentId = state?.adaptiveEnrollmentId ?? null

  const planQuery = useQuery({
    queryKey: ["adaptive", "plans", "current", adaptiveEnrollmentId],
    queryFn: () => AdaptiveService.getPlans(adaptiveEnrollmentId as string, { currentOnly: true }),
    enabled: Boolean(adaptiveEnrollmentId),
  })

  const currentPlan = planQuery.data?.[0] ?? null

  const buildPayload = (): IntakeRequest => {
    const minutes = Number(dailyMinutes)
    const horizon = Number(horizonDays)
    const load = Number(maxLoad)
    if (!Number.isInteger(minutes) || minutes < 15 || minutes > 720) throw new Error("Минут в день: 15..720")
    if (!Number.isInteger(horizon) || horizon < 1 || horizon > 28) throw new Error("Горизонт: 1..28")
    if (!Number.isInteger(load) || load < 1 || load > 5) throw new Error("Нагрузка: 1..5")

    return {
      routeMode,
      timezone,
      planHorizonDays: horizon,
      strictSlotsOnly,
      learningContext: {
        roleContext: roleContext.trim() || "Пользователь курса",
      },
      availability: {
        presetType,
        dailyMinutes: minutes,
        maxCognitiveLoad: load,
      },
    }
  }

  const runInit = async (courseEnrollmentId: string, payload: IntakeRequest) => {
    const enrollment = await AdaptiveService.intake(courseEnrollmentId, payload)
    await AdaptiveService.generatePlan({
      adaptiveEnrollmentId: enrollment.id,
      scope: (payload.planHorizonDays ?? 7) <= 1 ? "DAY" : "WEEK",
      dateStart: todayIsoLocal(),
    })
  }

  const enrollMutation = useMutation({
    mutationFn: () => CourseService.enroll(courseId),
    onSuccess: async () => {
      toast.success("Вы записаны на курс")
      await qc.invalidateQueries({ queryKey: ["adaptive"] })
    },
    onError: (error) => toast.error(parseError(error)),
  })

  const quickStartMutation = useMutation({
    mutationFn: async () => {
      const enrollment =
        state?.courseEnrollmentId != null ? { id: state.courseEnrollmentId } : await CourseService.enroll(courseId)
      const payload: IntakeRequest = {
        routeMode: "ADAPTIVE",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Moscow",
        planHorizonDays: 7,
        strictSlotsOnly: false,
        learningContext: { roleContext: "Самостоятельный пользователь" },
        availability: { presetType: "SELF_PACED_DAILY", dailyMinutes: 30, maxCognitiveLoad: 4 },
      }
      await runInit(enrollment.id, payload)
    },
    onSuccess: async () => {
      toast.success("Персональный маршрут готов")
      await qc.invalidateQueries({ queryKey: ["adaptive"] })
    },
    onError: (error) => toast.error(parseError(error)),
  })

  const customStartMutation = useMutation({
    mutationFn: async () => {
      if (!state?.courseEnrollmentId) throw new Error("Сначала запишитесь на курс")
      await runInit(state.courseEnrollmentId, buildPayload())
    },
    onSuccess: async () => {
      toast.success("Маршрут запущен по вашим настройкам")
      await qc.invalidateQueries({ queryKey: ["adaptive"] })
      setAdvanced(false)
    },
    onError: (error) => toast.error(parseError(error)),
  })

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!adaptiveEnrollmentId) throw new Error("Маршрут не найден")
      return AdaptiveService.generatePlan({
        adaptiveEnrollmentId,
        scope: currentPlan?.scope ?? "WEEK",
        dateStart: todayIsoLocal(),
      })
    },
    onSuccess: async () => {
      toast.success("Маршрут собран")
      await qc.invalidateQueries({ queryKey: ["adaptive"] })
    },
    onError: (error) => toast.error(parseError(error)),
  })

  const replanMutation = useMutation({
    mutationFn: async () => {
      if (!adaptiveEnrollmentId) throw new Error("Маршрут не найден")
      return AdaptiveService.replan({
        adaptiveEnrollmentId,
        trigger: "MANUAL_OVERRIDE",
        referenceDate: todayIsoLocal(),
      })
    },
    onSuccess: async () => {
      toast.success("План обновлен")
      await qc.invalidateQueries({ queryKey: ["adaptive"] })
    },
    onError: (error) => toast.error(parseError(error)),
  })

  const recoveryMutation = useMutation({
    mutationFn: async () => {
      if (!adaptiveEnrollmentId) throw new Error("Маршрут не найден")
      await AdaptiveService.startRecovery(adaptiveEnrollmentId, { triggerReason: "manual_recovery", debtMinutes: 0 })
      return AdaptiveService.replan({
        adaptiveEnrollmentId,
        trigger: "MANUAL_OVERRIDE",
        referenceDate: todayIsoLocal(),
        modeOverride: "RECOVERY",
      })
    },
    onSuccess: async () => {
      toast.success("Режим восстановления включен")
      await qc.invalidateQueries({ queryKey: ["adaptive"] })
    },
    onError: (error) => toast.error(parseError(error)),
  })

  const progressMutation = useMutation({
    mutationFn: async (params: { item: AdaptivePlanItemView; eventType: ProgressEventRequest["eventType"] }) => {
      if (!adaptiveEnrollmentId) throw new Error("Маршрут не найден")
      return AdaptiveService.createProgressEvent({
        adaptiveEnrollmentId,
        eventType: params.eventType,
        planItemId: params.item.id,
        blockId: params.item.blockId ?? undefined,
        workflowStageInstanceId: params.item.workflowStageInstanceId ?? undefined,
        idempotencyKey: `${params.item.id}:${params.eventType}:${Date.now()}`,
      })
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["adaptive"] })
      toast.success("Прогресс сохранен")
    },
    onError: (error) => toast.error(parseError(error)),
  })

  const isBusy =
    enrollMutation.isPending ||
    quickStartMutation.isPending ||
    customStartMutation.isPending ||
    generateMutation.isPending ||
    replanMutation.isPending ||
    recoveryMutation.isPending ||
    progressMutation.isPending

  const allItems = useMemo(() => [...(currentPlan?.items ?? [])], [currentPlan])
  const openItems = useMemo(() => allItems.filter((item) => isOpenStatus(item.status)), [allItems])
  const doneItems = useMemo(() => allItems.filter((item) => isDoneStatus(item.status)), [allItems])

  const nextFocusItem = useMemo(() => {
    return openItems
      .filter((item) => item.itemType === "BLOCK")
      .sort((a, b) => {
        const aTime = a.scheduledStart ? new Date(a.scheduledStart).getTime() : Number.MAX_SAFE_INTEGER
        const bTime = b.scheduledStart ? new Date(b.scheduledStart).getTime() : Number.MAX_SAFE_INTEGER
        return aTime - bTime
      })[0]
  }, [openItems])

  const visibleItems = useMemo(() => {
    if (statusFilter === "OPEN") return openItems
    if (statusFilter === "DONE") return doneItems
    return allItems
  }, [allItems, doneItems, openItems, statusFilter])

  return (
    <Card className="border-border bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Sparkles className="h-5 w-5" />
          Персональный маршрут
        </CardTitle>
        <CardDescription>
          Адаптивный помощник показывает следующий шаг, обновляет план и помогает восстановить темп обучения.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {stateQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : stateQuery.isError || !state ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <p className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Не удалось загрузить состояние маршрута.
            </p>
            <Button className="mt-2" variant="outline" size="sm" onClick={() => stateQuery.refetch()}>
              Повторить
            </Button>
          </div>
        ) : !state.adaptiveReady ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/45 p-3 text-sm text-muted-foreground">
            Для этого курса адаптивный маршрут еще не подготовлен. Попробуйте позже.
          </div>
        ) : !state.enrolled ? (
          <div className="rounded-xl border border-border bg-muted/45 p-4 text-sm">
            <p className="text-muted-foreground">Сначала запишитесь на курс, затем сможете собрать персональный маршрут.</p>
            <Button className="mt-3" onClick={() => enrollMutation.mutate()} disabled={isBusy}>
              {enrollMutation.isPending ? "Записываем..." : "Записаться на курс"}
            </Button>
          </div>
        ) : !state.adaptiveEnrollmentId ? (
          <div className="space-y-3 rounded-xl border border-border bg-muted/45 p-4">
            <div className="rounded-lg border border-border bg-card/70 p-3">
              <p className="text-sm font-medium text-foreground">Быстрый старт маршрута</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Система соберет персональный план на ближайшие дни и покажет первый учебный шаг.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => quickStartMutation.mutate()} disabled={isBusy}>
                  {quickStartMutation.isPending ? "Собираем маршрут..." : "Собрать персональный маршрут"}
                </Button>
                <Button variant="outline" onClick={() => setAdvanced((v) => !v)} disabled={isBusy}>
                  {advanced ? "Скрыть настройки" : "Настроить ритм"}
                </Button>
              </div>
            </div>

            {advanced ? (
              <div className="space-y-3 rounded-lg border border-border p-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Контекст обучения</p>
                  <Input value={roleContext} onChange={(e) => setRoleContext(e.target.value)} placeholder="Например: студент 3 курса" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min={15}
                    max={720}
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(e.target.value)}
                    placeholder="Минут в день"
                  />
                  <Input
                    type="number"
                    min={1}
                    max={28}
                    value={horizonDays}
                    onChange={(e) => setHorizonDays(e.target.value)}
                    placeholder="Горизонт (дни)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={maxLoad}
                    onChange={(e) => setMaxLoad(e.target.value)}
                    placeholder="Нагрузка 1..5"
                  />
                  <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Часовой пояс" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant={routeMode === "STRICT" ? "default" : "outline"} onClick={() => setRouteMode("STRICT")}>Строгий ритм</Button>
                  <Button variant={routeMode === "ADAPTIVE" ? "default" : "outline"} onClick={() => setRouteMode("ADAPTIVE")}>Адаптивный ритм</Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={presetType === "SELF_PACED_DAILY" ? "default" : "outline"}
                    onClick={() => setPresetType("SELF_PACED_DAILY")}
                  >
                    Ежедневно
                  </Button>
                  <Button
                    variant={presetType === "EVENING_FOCUSED" ? "default" : "outline"}
                    onClick={() => setPresetType("EVENING_FOCUSED")}
                  >
                    Вечерний режим
                  </Button>
                </div>

                <label className="flex items-center gap-2 rounded-md border border-border px-2 py-2 text-sm text-muted-foreground">
                  <input type="checkbox" checked={strictSlotsOnly} onChange={(e) => setStrictSlotsOnly(e.target.checked)} />
                  Учитывать только фиксированные окна времени
                </label>

                <Button onClick={() => customStartMutation.mutate()} disabled={isBusy}>
                  {customStartMutation.isPending ? "Запускаем..." : "Запустить по настройкам"}
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{modeLabel(state.routeMode)}</Badge>
              <Badge>Активные шаги: {openItems.length}</Badge>
              <Badge variant="secondary">Завершено: {doneItems.length}</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant={focusMode ? "default" : "outline"} size="sm" onClick={() => setFocusMode(true)}>
                <Target className="h-3.5 w-3.5" />
                Фокус на следующем шаге
              </Button>
              <Button variant={!focusMode ? "default" : "outline"} size="sm" onClick={() => setFocusMode(false)}>
                Полный план
              </Button>
              <Button variant="outline" size="sm" onClick={() => generateMutation.mutate()} disabled={isBusy}>
                <RefreshCcw className="h-3.5 w-3.5" />
                Собрать маршрут
              </Button>
              <Button variant="outline" size="sm" onClick={() => replanMutation.mutate()} disabled={isBusy}>
                Обновить план
              </Button>
              <Button size="sm" onClick={() => recoveryMutation.mutate()} disabled={isBusy || state.routeMode === "RECOVERY"}>
                <ShieldAlert className="h-3.5 w-3.5" />
                Восстановить темп
              </Button>
            </div>

            {planQuery.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : !currentPlan ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/45 p-3 text-sm text-muted-foreground">
                Текущий план еще не создан. Нажмите «Собрать маршрут».
              </div>
            ) : focusMode ? (
              <div className="space-y-3 rounded-xl border border-border bg-muted/45 p-3 text-sm">
                <p className="text-xs text-muted-foreground">Показываем только следующий учебный шаг.</p>
                {nextFocusItem ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{statusLabel(nextFocusItem.status)}</Badge>
                      <Badge variant="secondary">{nextFocusItem.expectedMinutes} мин</Badge>
                    </div>
                    <p className="text-base font-semibold text-foreground">{nextFocusItem.title || "Следующий шаг"}</p>
                    <p className="text-xs text-muted-foreground">
                      <Clock3 className="mr-1 inline h-3.5 w-3.5" />
                      {formatPlanTime(nextFocusItem.scheduledStart)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        disabled={isBusy || nextFocusItem.status !== "PLANNED"}
                        onClick={() => progressMutation.mutate({ item: nextFocusItem, eventType: "BLOCK_STARTED" })}
                      >
                        <Play className="h-3.5 w-3.5" />
                        Начать шаг
                      </Button>
                      <Button
                        disabled={isBusy || (nextFocusItem.status !== "PLANNED" && nextFocusItem.status !== "IN_PROGRESS")}
                        onClick={() => progressMutation.mutate({ item: nextFocusItem, eventType: "BLOCK_COMPLETED" })}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Завершить шаг
                      </Button>
                      <Button
                        variant="outline"
                        disabled={isBusy || (nextFocusItem.status !== "PLANNED" && nextFocusItem.status !== "IN_PROGRESS")}
                        onClick={() => progressMutation.mutate({ item: nextFocusItem, eventType: "BLOCK_SKIPPED" })}
                      >
                        <SkipForward className="h-3.5 w-3.5" />
                        Пропустить шаг
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-md border border-success/35 bg-success/10 p-3 text-sm text-foreground">
                    Активных шагов сейчас нет. Отличный прогресс.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border border-border bg-muted/45 p-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Button size="xs" variant={statusFilter === "OPEN" ? "default" : "outline"} onClick={() => setStatusFilter("OPEN")}>Активные</Button>
                  <Button size="xs" variant={statusFilter === "DONE" ? "default" : "outline"} onClick={() => setStatusFilter("DONE")}>Завершенные</Button>
                  <Button size="xs" variant={statusFilter === "ALL" ? "default" : "outline"} onClick={() => setStatusFilter("ALL")}>Все</Button>
                </div>

                {visibleItems.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                    Нет шагов по выбранному фильтру.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {visibleItems.map((item) => {
                      const workflow = item.itemType === "WORKFLOW_STAGE"
                      const pending = progressMutation.isPending && progressMutation.variables?.item.id === item.id
                      const canStart = !workflow && item.status === "PLANNED"
                      const canDone = !workflow && (item.status === "PLANNED" || item.status === "IN_PROGRESS")
                      const canSkip = !workflow && (item.status === "PLANNED" || item.status === "IN_PROGRESS")

                      return (
                        <div key={item.id} className="space-y-2 rounded-md border border-border bg-card/70 p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{itemTypeLabel(item.itemType)}</Badge>
                            <Badge variant="secondary">{statusLabel(item.status)}</Badge>
                            <Badge>{item.expectedMinutes} мин</Badge>
                          </div>
                          <p className="font-medium text-foreground">{item.title || "Шаг плана"}</p>
                          <p className="text-xs text-muted-foreground">
                            <Clock3 className="mr-1 inline h-3.5 w-3.5" />
                            {formatPlanTime(item.scheduledStart)}
                            {item.scheduledEnd ? ` - ${formatPlanTime(item.scheduledEnd)}` : ""}
                          </p>

                          {workflow ? (
                            <p className="text-xs text-muted-foreground">
                              Этот этап фиксируется через контур преподавателя и не закрывается вручную.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="xs"
                                variant="outline"
                                disabled={!canStart || isBusy || pending}
                                onClick={() => progressMutation.mutate({ item, eventType: "BLOCK_STARTED" })}
                              >
                                <Play className="h-3.5 w-3.5" />
                                Начать
                              </Button>
                              <Button
                                size="xs"
                                disabled={!canDone || isBusy || pending}
                                onClick={() => progressMutation.mutate({ item, eventType: "BLOCK_COMPLETED" })}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Готово
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                disabled={!canSkip || isBusy || pending}
                                onClick={() => progressMutation.mutate({ item, eventType: "BLOCK_SKIPPED" })}
                              >
                                <SkipForward className="h-3.5 w-3.5" />
                                Пропустить
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
