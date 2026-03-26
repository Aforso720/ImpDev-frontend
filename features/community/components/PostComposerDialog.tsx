"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CommunityService } from "@/features/community/community.service"
import type { PostCategoryKey, PostFeedItem, PostVisibility } from "@/features/community/community.types"
import { UniversityService } from "@/features/university/university.service"

type ComposerPreset = {
  universityId?: string
  groupId?: string
  visibility?: PostVisibility
  lockUniversity?: boolean
  lockGroup?: boolean
  allowedVisibilities?: PostVisibility[]
}

type PostComposerDialogProps = {
  trigger: React.ReactNode
  mode?: "create" | "edit"
  post?: PostFeedItem
  preset?: ComposerPreset
  onSuccess?: () => void
}

const restrictedCategoryKeys: PostCategoryKey[] = ["NEWS", "ANNOUNCEMENT", "EVENT"]

function visibilityLabel(value: PostVisibility) {
  if (value === "GROUP") return "Сообщество"
  if (value === "UNIVERSITY") return "Университет"
  return "Публично"
}

export function PostComposerDialog({
  trigger,
  mode = "create",
  post,
  preset,
  onSuccess,
}: PostComposerDialogProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)

  const [title, setTitle] = React.useState("")
  const [contentMd, setContentMd] = React.useState("")
  const [coverUrl, setCoverUrl] = React.useState("")
  const [visibility, setVisibility] = React.useState<PostVisibility>(preset?.visibility ?? "PUBLIC")
  const [selectedUniversityId, setSelectedUniversityId] = React.useState(preset?.universityId ?? "")
  const [selectedGroupId, setSelectedGroupId] = React.useState(preset?.groupId ?? "")
  const [selectedCategories, setSelectedCategories] = React.useState<PostCategoryKey[]>(["ACHIEVEMENT"])

  const isEdit = mode === "edit"
  const isGroupFixed = Boolean(preset?.groupId && preset?.lockGroup)

  const { data: categories = [] } = useQuery({
    queryKey: ["community", "post-categories"],
    queryFn: () => CommunityService.getPostCategories(),
  })

  const { data: myUniversities = [] } = useQuery({
    queryKey: ["community", "my-universities"],
    queryFn: () => UniversityService.getMy(),
  })

  const { data: groups = [] } = useQuery({
    queryKey: ["community", "groups", selectedUniversityId],
    enabled: !isEdit && visibility === "GROUP" && selectedUniversityId.length > 0,
    queryFn: () => UniversityService.getGroups(selectedUniversityId),
  })

  React.useEffect(() => {
    if (!open) return

    if (isEdit && post) {
      setTitle(post.title)
      setContentMd(post.contentMd)
      setCoverUrl(post.coverUrl ?? "")
      setVisibility(post.visibility)
      setSelectedUniversityId(post.university?.id ?? preset?.universityId ?? "")
      setSelectedGroupId(post.group?.id ?? "")
      setSelectedCategories(post.categories.map((item) => item.key))
      return
    }

    setTitle("")
    setContentMd("")
    setCoverUrl("")
    setVisibility(preset?.visibility ?? "PUBLIC")
    setSelectedUniversityId(preset?.universityId ?? "")
    setSelectedGroupId(preset?.groupId ?? "")
    setSelectedCategories(["ACHIEVEMENT"])
  }, [isEdit, open, post, preset?.groupId, preset?.universityId, preset?.visibility])

  const allowedVisibilities = preset?.allowedVisibilities ?? ["PUBLIC", "UNIVERSITY", "GROUP"]
  const canSelectGroup = visibility === "GROUP" && selectedUniversityId.length > 0 && !isGroupFixed
  const hasRestrictedCategory = selectedCategories.some((category) => restrictedCategoryKeys.includes(category))

  const hintText = React.useMemo(() => {
    if (isEdit) {
      return "Редактирование выполняется через модальное окно. После сохранения пост в ленте обновится автоматически."
    }
    if (visibility === "PUBLIC" && hasRestrictedCategory) {
      return "Для публичной ленты доступны категории «Достижение» и «Набор в команду»."
    }
    if ((visibility === "UNIVERSITY" || visibility === "GROUP") && hasRestrictedCategory) {
      return "Категории «Новость», «Объявление», «Мероприятие» требуют роли руководителя/преподавателя."
    }
    return "Посты в категории «Достижение» и «Набор в команду» доступны пользователям без роли модератора."
  }, [hasRestrictedCategory, isEdit, visibility])

  const upsertMutation = useMutation({
    mutationFn: async () => {
      const cleanTitle = title.trim()
      const cleanContent = contentMd.trim()
      const cleanCover = coverUrl.trim()

      if (!cleanTitle || !cleanContent) {
        throw new Error("Укажите заголовок и текст поста")
      }

      if (!selectedCategories.length) {
        throw new Error("Выберите хотя бы одну категорию")
      }

      if (!isEdit) {
        if ((visibility === "UNIVERSITY" || visibility === "GROUP") && !selectedUniversityId) {
          throw new Error("Выберите университет для публикации")
        }

        if (visibility === "GROUP" && !selectedGroupId) {
          throw new Error("Выберите сообщество")
        }

        return CommunityService.createPost({
          title: cleanTitle,
          contentMd: cleanContent,
          coverUrl: cleanCover || undefined,
          visibility,
          categoryKeys: selectedCategories,
          universityId: visibility === "PUBLIC" ? undefined : selectedUniversityId,
          groupId: visibility === "GROUP" ? selectedGroupId : undefined,
        })
      }

      if (!post) throw new Error("Пост не найден")

      return CommunityService.updatePost(post.id, {
        title: cleanTitle,
        contentMd: cleanContent,
        coverUrl: cleanCover || undefined,
        categoryKeys: selectedCategories,
      })
    },
    onSuccess: async () => {
      toast.success(isEdit ? "Пост обновлен" : "Пост опубликован")
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["community", "posts"] })
      if (post?.id) {
        await queryClient.invalidateQueries({ queryKey: ["community", "post", post.id] })
      }
      onSuccess?.()
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Не удалось выполнить действие с постом"
      toast.error(message)
    },
  })

  const toggleCategory = (key: PostCategoryKey) => {
    setSelectedCategories((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev
        return prev.filter((item) => item !== key)
      }

      return [...prev, key]
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактирование поста" : "Создание поста"}</DialogTitle>
          <DialogDescription>{hintText}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Заголовок</label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Заголовок поста"
              maxLength={200}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Текст</label>
            <Textarea
              value={contentMd}
              onChange={(event) => setContentMd(event.target.value)}
              placeholder="Напишите текст публикации..."
              className="min-h-[130px] resize-y"
              maxLength={10000}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Обложка (необязательно)</label>
            <Input value={coverUrl} onChange={(event) => setCoverUrl(event.target.value)} placeholder="https://..." />
          </div>

          {!isEdit ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Видимость</label>
                <select
                  value={visibility}
                  onChange={(event) => {
                    const nextVisibility = event.target.value as PostVisibility
                    setVisibility(nextVisibility)

                    if (nextVisibility === "PUBLIC") {
                      setSelectedUniversityId(preset?.lockUniversity ? preset.universityId ?? "" : "")
                      setSelectedGroupId(preset?.lockGroup ? preset.groupId ?? "" : "")
                      return
                    }

                    if (nextVisibility === "GROUP" && preset?.groupId) {
                      setSelectedGroupId(preset.groupId)
                    }
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {allowedVisibilities.map((item) => (
                    <option key={item} value={item}>
                      {visibilityLabel(item)}
                    </option>
                  ))}
                </select>
              </div>

              {visibility === "UNIVERSITY" || visibility === "GROUP" ? (
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Университет</label>
                  <select
                    value={selectedUniversityId}
                    onChange={(event) => {
                      setSelectedUniversityId(event.target.value)
                      setSelectedGroupId(preset?.lockGroup ? preset.groupId ?? "" : "")
                    }}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    disabled={preset?.lockUniversity}
                  >
                    <option value="">Выберите университет</option>
                    {myUniversities.map((university) => (
                      <option key={university.id} value={university.id}>
                        {university.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div />
              )}
            </div>
          ) : null}

          {!isEdit && visibility === "GROUP" ? (
            <div className="grid gap-2">
              <label className="text-sm font-medium">Сообщество</label>
              {isGroupFixed ? (
                <div className="rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-ink-soft">
                  Сообщество определено текущим разделом.
                </div>
              ) : (
                <select
                  value={selectedGroupId}
                  onChange={(event) => setSelectedGroupId(event.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={!canSelectGroup}
                >
                  <option value="">Выберите сообщество</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : null}

          <div className="grid gap-2">
            <label className="text-sm font-medium">Категории</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {categories.map((category) => {
                const checked = selectedCategories.includes(category.key)
                return (
                  <label
                    key={category.id}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border border-brand-soft/60 bg-white/75 px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(category.key)}
                      className="mt-0.5"
                    />
                    <span className="text-sm">
                      <span className="block font-medium text-ink-strong">{category.title}</span>
                      {category.description ? (
                        <span className="block text-xs text-ink-muted">{category.description}</span>
                      ) : null}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={upsertMutation.isPending}>
            Отмена
          </Button>
          <Button type="button" onClick={() => upsertMutation.mutate()} disabled={upsertMutation.isPending}>
            {upsertMutation.isPending ? "Сохраняем..." : isEdit ? "Сохранить" : "Опубликовать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}