"use client"

import Link from "next/link"
import { Loader2, Save } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { CourseScope, CreateCoursePayload } from "../course.types"
import { CourseScopeTargetField, type CourseFormAudience } from "./CourseScopeTargetField"

type CourseFormValues = {
  title: string
  slug: string
  description: string
  scope: CourseScope
  universityId: string
  teamId: string
}

type CourseFormProps = {
  audience: CourseFormAudience
  initialValues?: Partial<CourseFormValues>
  submitLabel: string
  cancelHref: string
  isSubmitting?: boolean
  errorMessage?: string
  onSubmit: (payload: CreateCoursePayload) => void
}

const selectClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"

export function CourseForm({
  audience,
  initialValues,
  submitLabel,
  cancelHref,
  isSubmitting = false,
  errorMessage,
  onSubmit,
}: CourseFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CourseFormValues>({
    defaultValues: {
      title: initialValues?.title ?? "",
      slug: initialValues?.slug ?? "",
      description: initialValues?.description ?? "",
      scope: initialValues?.scope ?? "PUBLIC",
      universityId: initialValues?.universityId ?? "",
      teamId: initialValues?.teamId ?? "",
    },
  })

  const scope = watch("scope")

  const submit = handleSubmit((values) => {
    const payload: CreateCoursePayload = {
      title: values.title.trim(),
      slug: values.slug.trim(),
      description: values.description.trim(),
      scope: values.scope,
    }

    if (values.scope === "UNIVERSITY") payload.universityId = values.universityId.trim()
    if (values.scope === "TEAM") payload.teamId = values.teamId.trim()

    onSubmit(payload)
  })

  return (
    <form className="space-y-5" onSubmit={submit}>
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Основные данные</CardTitle>
          <CardDescription>Название, адрес и описание курса, которые увидят пользователи.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="course-title">Название</Label>
            <Input
              id="course-title"
              autoComplete="off"
              aria-invalid={Boolean(errors.title)}
              placeholder="Например, Основы проектной работы"
              {...register("title", {
                validate: (value) => {
                  const length = value.trim().length
                  if (length < 3) return "Название должно содержать минимум 3 символа"
                  if (length > 120) return "Название не должно превышать 120 символов"
                  return true
                },
              })}
            />
            {errors.title ? <p className="text-sm text-error">{errors.title.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-slug">Slug</Label>
            <Input
              id="course-slug"
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={Boolean(errors.slug)}
              placeholder="osnovy-proektnoy-raboty"
              {...register("slug", {
                validate: (value) => {
                  const slug = value.trim()
                  if (slug.length < 3) return "Slug должен содержать минимум 3 символа"
                  if (slug.length > 80) return "Slug не должен превышать 80 символов"
                  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
                    return "Используйте строчные латинские буквы, цифры и дефисы"
                  }
                  return true
                },
              })}
            />
            {errors.slug ? <p className="text-sm text-error">{errors.slug.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-description">Описание</Label>
            <Textarea
              id="course-description"
              className="min-h-36 resize-y"
              aria-invalid={Boolean(errors.description)}
              placeholder="Расскажите, чему посвящён курс и чему научатся участники."
              {...register("description", {
                validate: (value) => {
                  const length = value.trim().length
                  if (length < 10) return "Описание должно содержать минимум 10 символов"
                  if (length > 2000) return "Описание не должно превышать 2000 символов"
                  return true
                },
              })}
            />
            {errors.description ? <p className="text-sm text-error">{errors.description.message}</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Доступ к курсу</CardTitle>
          <CardDescription>Определите, кому будет доступен курс после публикации.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="course-scope">Scope</Label>
            <select id="course-scope" className={selectClassName} {...register("scope")}>
              <option value="PUBLIC">Public</option>
              <option value="UNIVERSITY">University</option>
              <option value="TEAM">Team</option>
            </select>
          </div>

          {scope === "UNIVERSITY" ? (
            <Controller
              key="university"
              name="universityId"
              control={control}
              rules={{
                validate: (value) =>
                  scope !== "UNIVERSITY" || Boolean(value.trim()) || "Выберите университет",
              }}
              render={({ field }) => (
                <CourseScopeTargetField
                  audience={audience}
                  target="university"
                  value={field.value}
                  error={errors.universityId?.message}
                  onChange={field.onChange}
                />
              )}
            />
          ) : null}

          {scope === "TEAM" ? (
            <Controller
              key="team"
              name="teamId"
              control={control}
              rules={{
                validate: (value) => scope !== "TEAM" || Boolean(value.trim()) || "Выберите команду",
              }}
              render={({ field }) => (
                <CourseScopeTargetField
                  audience={audience}
                  target="team"
                  value={field.value}
                  error={errors.teamId?.message}
                  onChange={field.onChange}
                />
              )}
            />
          ) : null}
        </CardContent>
      </Card>

      {errorMessage ? (
        <div className="rounded-md border border-error/35 bg-error/10 p-4 text-sm text-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Button asChild type="button" variant="outline" disabled={isSubmitting}>
          <Link href={cancelHref}>Отмена</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
