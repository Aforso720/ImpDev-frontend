"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminTeams, useAdminUniversities } from "@/features/admin/hooks"
import { TeamService } from "@/features/team/team.service"
import { UniversityService } from "@/features/university/university.service"
import { userService } from "@/lib/services/user.service"

export type CourseFormAudience = "admin" | "teacher"

type ScopeTarget = "university" | "team"

type ScopeOption = {
  id: string
  label: string
}

type CourseScopeTargetFieldProps = {
  audience: CourseFormAudience
  target: ScopeTarget
  value: string
  error?: string
  onChange: (value: string) => void
}

const selectClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"

function includesSearch(value: string, search: string) {
  return value.toLocaleLowerCase().includes(search.toLocaleLowerCase())
}

function currentValueLabel(value: string) {
  return `Текущее значение · ${value}`
}

export function CourseScopeTargetField({
  audience,
  target,
  value,
  error,
  onChange,
}: CourseScopeTargetFieldProps) {
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search.trim())
  const isUniversity = target === "university"
  const userQuery = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => userService.getProfile(),
    enabled: audience === "teacher",
  })
  const isAdmin = audience === "admin" || userQuery.data?.role === "ADMIN"
  const isTeacher = audience === "teacher" && Boolean(userQuery.data) && userQuery.data?.role !== "ADMIN"

  const adminUniversitiesQuery = useAdminUniversities(
    { page: 1, limit: 100, q: deferredSearch || undefined },
    { enabled: isAdmin && isUniversity },
  )
  const adminTeamsQuery = useAdminTeams(
    { page: 1, limit: 100, q: deferredSearch || undefined },
    { enabled: isAdmin && !isUniversity },
  )

  const teacherUniversitiesQuery = useQuery({
    queryKey: ["universities", "my"],
    queryFn: () => UniversityService.getMy(),
    enabled: isTeacher && isUniversity,
  })
  const teacherTeamQuery = useQuery({
    queryKey: ["team", "me"],
    queryFn: () => TeamService.getMeTeam(),
    enabled: isTeacher && !isUniversity && Boolean(userQuery.data?.teamId),
    retry: 0,
  })

  const options = useMemo<ScopeOption[]>(() => {
    if (isAdmin && isUniversity) {
      return (adminUniversitiesQuery.data?.items ?? []).map((university) => ({
        id: university.id,
        label: `${university.shortName || university.name || "Университет"}${university.status ? ` · ${university.status}` : ""}`,
      }))
    }

    if (isAdmin) {
      return (adminTeamsQuery.data?.items ?? []).map((team) => ({
        id: team.id,
        label: `${team.name || "Команда"}${team.status ? ` · ${team.status}` : ""}`,
      }))
    }

    if (isUniversity) {
      return (teacherUniversitiesQuery.data ?? [])
        .filter(
          (university) =>
            university.myStatus === "ACTIVE" &&
            (university.myRole === "INSTRUCTOR" || university.myRole === "LEADER"),
        )
        .filter(
          (university) =>
            !deferredSearch ||
            includesSearch(university.name, deferredSearch) ||
            includesSearch(university.slug, deferredSearch),
        )
        .map((university) => ({
          id: university.id,
          label: `${university.name} · ${university.myRole}`,
        }))
    }

    const team = teacherTeamQuery.data
    return team ? [{ id: team.id, label: `${team.name} · ${team.status}` }] : []
  }, [
    adminTeamsQuery.data,
    adminUniversitiesQuery.data,
    deferredSearch,
    isAdmin,
    isUniversity,
    teacherTeamQuery.data,
    teacherUniversitiesQuery.data,
  ])

  const optionsWithCurrent = useMemo(
    () =>
      value && !options.some((option) => option.id === value)
        ? [{ id: value, label: currentValueLabel(value) }, ...options]
        : options,
    [options, value],
  )

  const isLoading =
    (audience === "teacher" && userQuery.isLoading) ||
    (isAdmin
      ? isUniversity
        ? adminUniversitiesQuery.isLoading
        : adminTeamsQuery.isLoading
      : isUniversity
        ? teacherUniversitiesQuery.isLoading
        : Boolean(userQuery.data?.teamId) && teacherTeamQuery.isLoading)
  const isFetching = isAdmin
    ? isUniversity
      ? adminUniversitiesQuery.isFetching
      : adminTeamsQuery.isFetching
    : isUniversity
      ? teacherUniversitiesQuery.isFetching
      : teacherTeamQuery.isFetching
  const isError =
    (audience === "teacher" && userQuery.isError) ||
    (isAdmin
      ? isUniversity
        ? adminUniversitiesQuery.isError
        : adminTeamsQuery.isError
      : isUniversity
        ? teacherUniversitiesQuery.isError
        : teacherTeamQuery.isError)

  function retry() {
    if (audience === "teacher" && userQuery.isError) void userQuery.refetch()
    else if (isAdmin && isUniversity) void adminUniversitiesQuery.refetch()
    else if (isAdmin) void adminTeamsQuery.refetch()
    else if (isUniversity) void teacherUniversitiesQuery.refetch()
    else void teacherTeamQuery.refetch()
  }

  const label = isUniversity ? "Университет" : "Команда"
  const fieldId = isUniversity ? "course-university-id" : "course-team-id"
  const showSearch = isAdmin || isUniversity

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>

      {showSearch ? (
        <div className="relative">
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Поиск: ${label.toLocaleLowerCase()}`}
            aria-label={`Поиск: ${label.toLocaleLowerCase()}`}
          />
          {isFetching && !isLoading ? (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : null}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-2" aria-label={`Загрузка: ${label.toLocaleLowerCase()}`}>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : isError ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-error/35 bg-error/10 p-3 text-sm text-error" role="alert">
          <span>Не удалось загрузить варианты. Проверьте соединение и повторите попытку.</span>
          <Button type="button" size="sm" variant="outline" onClick={retry}>
            <RefreshCw className="size-4" />
            Повторить
          </Button>
        </div>
      ) : (
        <>
          <select
            id={fieldId}
            className={selectClassName}
            value={value}
            aria-invalid={Boolean(error)}
            onChange={(event) => onChange(event.target.value)}
          >
            <option value="">Выберите: {label.toLocaleLowerCase()}</option>
            {optionsWithCurrent.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {deferredSearch
                ? "По вашему запросу ничего не найдено."
                : isAdmin
                  ? `В каталоге пока нет доступных записей типа «${label}».`
                  : isUniversity
                    ? "Нет активных memberships с ролью INSTRUCTOR или LEADER."
                    : "Вы не состоите в команде, поэтому TEAM scope сейчас недоступен."}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "Варианты загружены из административного каталога."
                : isUniversity
                  ? "Показаны только активные memberships, позволяющие управлять курсами."
                  : "Для преподавателя backend разрешает выбрать только его текущую команду."}
            </p>
          )}
        </>
      )}

      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  )
}
