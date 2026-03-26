"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CalendarClock,
  ExternalLink,
  HandHeart,
  Heart,
  MessageCircle,
  Newspaper,
  PartyPopper,
  Pencil,
  Rocket,
  SendHorizontal,
  SquarePen,
  Trash2,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confrim-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { CommunityService } from "@/features/community/community.service"
import { PostComposerDialog } from "@/features/community/components/PostComposerDialog"
import type { EventListItem, PostFeedItem, PostReactionType, ProjectListItem } from "@/features/community/community.types"
import { userService } from "@/lib/services/user.service"

type CommunityHighlightsProps = {
  className?: string
  postsLimit?: number
  eventsLimit?: number
  projectsLimit?: number
  universityId?: string
  groupId?: string
  heading?: string
  description?: string
  showSidePanels?: boolean
  showCreateButton?: boolean
}

const reactionOptions: Array<{ type: PostReactionType; label: string; icon: LucideIcon }> = [
  { type: "LIKE", label: "Нравится", icon: Heart },
  { type: "SUPPORT", label: "Поддерживаю", icon: HandHeart },
  { type: "CELEBRATE", label: "Поздравляю", icon: PartyPopper },
]

function trimText(value: string, max: number) {
  if (value.length <= max) return value
  return `${value.slice(0, max).trim()}...`
}

function formatDateTime(value: string | null) {
  if (!value) return "Без даты"
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function visibilityLabel(value: PostFeedItem["visibility"]) {
  if (value === "GROUP") return "Сообщество"
  if (value === "UNIVERSITY") return "Университет"
  return "Публично"
}

function eventFormatLabel(value: EventListItem["format"]) {
  if (value === "ONLINE") return "Онлайн"
  if (value === "OFFLINE") return "Оффлайн"
  return "Гибрид"
}

function projectStatusLabel(value: ProjectListItem["status"]) {
  if (value === "ACTIVE") return "Активен"
  if (value === "PLANNING") return "Планирование"
  if (value === "ON_HOLD") return "На паузе"
  if (value === "COMPLETED") return "Завершен"
  return "Архив"
}

export function CommunityHighlights({
  className,
  postsLimit = 10,
  eventsLimit = 4,
  projectsLimit = 4,
  universityId,
  groupId,
  heading = "Лента новостей",
  description = "Публикации, обсуждения и реакции пользователей.",
  showSidePanels = true,
  showCreateButton = true,
}: CommunityHighlightsProps) {
  const queryClient = useQueryClient()
  const [activePostId, setActivePostId] = useState<string | null>(null)
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})

  const { data: me } = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => userService.getProfile(),
  })

  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ["community", "posts", postsLimit, universityId ?? "all", groupId ?? "all"],
    queryFn: () =>
      CommunityService.getPosts({
        limit: postsLimit,
        universityId,
        groupId,
      }),
  })

  const { data: eventsData, isLoading: isEventsLoading } = useQuery({
    queryKey: ["community", "events", eventsLimit],
    enabled: showSidePanels,
    queryFn: () => CommunityService.getEvents({ limit: eventsLimit, upcomingOnly: true }),
  })

  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["community", "projects", projectsLimit],
    enabled: showSidePanels,
    queryFn: () => CommunityService.getProjects({ limit: projectsLimit }),
  })

  const { data: activePostDetail, isLoading: isActivePostLoading } = useQuery({
    queryKey: ["community", "post", activePostId],
    enabled: !!activePostId,
    queryFn: () => CommunityService.getPostById(activePostId as string),
  })

  const reactMutation = useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: PostReactionType }) =>
      CommunityService.reactToPost(postId, { type }),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["community", "posts"] })
      void queryClient.invalidateQueries({ queryKey: ["community", "post", variables.postId] })
    },
    onError: () => {
      toast.error("Не удалось поставить реакцию")
    },
  })

  const commentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      CommunityService.addComment(postId, { contentMd: content }),
    onSuccess: (_, variables) => {
      toast.success("Комментарий добавлен")
      setCommentDrafts((prev) => ({ ...prev, [variables.postId]: "" }))
      void queryClient.invalidateQueries({ queryKey: ["community", "posts"] })
      void queryClient.invalidateQueries({ queryKey: ["community", "post", variables.postId] })
    },
    onError: () => {
      toast.error("Не удалось добавить комментарий")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => CommunityService.deletePost(postId),
    onSuccess: () => {
      toast.success("Пост удален")
      setActivePostId(null)
      void queryClient.invalidateQueries({ queryKey: ["community", "posts"] })
    },
    onError: () => {
      toast.error("Не удалось удалить пост")
    },
  })

  const posts = postsData?.items ?? []
  const events = eventsData?.items ?? []
  const projects = projectsData?.items ?? []

  const handleSubmitComment = (postId: string) => {
    const content = (commentDrafts[postId] ?? "").trim()
    if (!content) return
    commentMutation.mutate({ postId, content })
  }

  const composerPreset =
    groupId && universityId
      ? {
          universityId,
          groupId,
          visibility: "GROUP" as PostFeedItem["visibility"],
          lockUniversity: true,
          lockGroup: true,
          allowedVisibilities: ["GROUP"] as PostFeedItem["visibility"][],
        }
      : universityId
        ? {
            universityId,
            visibility: "UNIVERSITY" as PostFeedItem["visibility"],
            lockUniversity: true,
            allowedVisibilities: ["UNIVERSITY", "GROUP"] as PostFeedItem["visibility"][],
          }
        : undefined

  return (
    <section className={className}>
      <section className="overflow-hidden rounded-xl border border-brand-soft bg-soft-panel shadow-sm">
        <header className="border-b border-brand-soft/50 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-strong">
                <Newspaper className="h-5 w-5" />
                {heading}
              </h2>
              <p className="mt-1 text-sm text-ink-soft">{description}</p>
            </div>

            {showCreateButton ? (
              <PostComposerDialog
                trigger={
                  <Button size="sm" className="gap-2">
                    <SquarePen className="h-4 w-4" />
                    Новый пост
                  </Button>
                }
                preset={composerPreset}
              />
            ) : null}
          </div>
        </header>

        <div className={showSidePanels ? "grid gap-6 p-6 xl:grid-cols-[1.55fr_1fr]" : "p-6"}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink-strong">Публикации</h3>
              <Badge variant="outline">{postsData?.total ?? 0}</Badge>
            </div>

            {isPostsLoading ? (
              Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} className="h-36 rounded-xl" />)
            ) : posts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-soft bg-white/70 p-5 text-sm text-ink-muted">
                Пока нет публикаций для этого раздела.
              </div>
            ) : (
              posts.map((post) => {
                const isActive = activePostId === post.id
                const detail = isActive && activePostDetail?.id === post.id ? activePostDetail : null
                const canManage = me?.id === post.author.id || me?.role === "ADMIN"

                return (
                  <article key={post.id} className="rounded-xl border border-brand-soft bg-white/90 p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                      <Badge variant="secondary">{visibilityLabel(post.visibility)}</Badge>
                      {post.categories.map((category) => (
                        <Badge key={category.id} variant="outline">
                          {category.title}
                        </Badge>
                      ))}
                      <span className="ml-auto">{formatDateTime(post.publishedAt ?? post.createdAt)}</span>
                    </div>

                    <h4 className="mt-2 text-lg font-semibold text-ink-strong">{post.title}</h4>
                    <p className="mt-1 text-sm text-ink-soft">{trimText(post.contentMd, 220)}</p>

                    {post.coverUrl ? (
                      <div className="mt-3 overflow-hidden rounded-lg border border-brand-soft/60">
                        <img src={post.coverUrl} alt={post.title} className="h-52 w-full object-cover" />
                      </div>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-ink-muted">
                        <span className="font-medium text-ink-strong">{post.author.name}</span>
                        {post.university ? ` • ${post.university.name}` : ""}
                        {post.group ? ` • ${post.group.name}` : ""}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {reactionOptions.map((reaction) => {
                          const isSelected = post.myReaction === reaction.type
                          return (
                            <Button
                              key={reaction.type}
                              type="button"
                              size="xs"
                              variant={isSelected ? "default" : "outline"}
                              className="gap-1"
                              onClick={() => reactMutation.mutate({ postId: post.id, type: reaction.type })}
                              disabled={reactMutation.isPending}
                            >
                              <reaction.icon className="h-3.5 w-3.5" />
                              {reaction.label}
                            </Button>
                          )
                        })}

                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          className="gap-1"
                          onClick={() => setActivePostId((prev) => (prev === post.id ? null : post.id))}
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          Комментарии
                        </Button>

                        {canManage ? (
                          <>
                            <PostComposerDialog
                              mode="edit"
                              post={post}
                              trigger={
                                <Button type="button" size="icon-xs" variant="outline" aria-label="Редактировать пост">
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              }
                            />

                            <ConfirmDialog
                              trigger={
                                <Button type="button" size="icon-xs" variant="destructive" aria-label="Удалить пост">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              }
                              title="Удалить пост?"
                              description="Пост и комментарии будут удалены без возможности восстановления."
                              confirmText="Удалить"
                              onConfirm={() => deleteMutation.mutate(post.id)}
                              isLoading={deleteMutation.isPending}
                            />
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-ink-muted">
                      {post._count.reactions} реакций • {post._count.comments} комментариев
                    </div>

                    {isActive ? (
                      <section className="mt-4 space-y-3 rounded-lg border border-brand-soft/60 bg-background p-3">
                        {isActivePostLoading ? (
                          <Skeleton className="h-24 rounded-lg" />
                        ) : (
                          <>
                            <div className="space-y-2">
                              {detail?.comments.length ? (
                                detail.comments.map((comment) => (
                                  <div key={comment.id} className="rounded-lg border border-brand-soft/50 bg-white p-3">
                                    <p className="text-xs text-ink-muted">
                                      <span className="font-medium text-ink-strong">{comment.author.name}</span>
                                      {" • "}
                                      {formatDateTime(comment.createdAt)}
                                    </p>
                                    <p className="mt-1 text-sm text-ink-soft">{comment.contentMd}</p>

                                    {comment.replies.length ? (
                                      <div className="mt-2 space-y-2 border-l border-brand-soft/50 pl-3">
                                        {comment.replies.map((reply) => (
                                          <div key={reply.id} className="rounded-md bg-muted/40 p-2">
                                            <p className="text-xs text-ink-muted">
                                              <span className="font-medium text-ink-strong">{reply.author.name}</span>
                                              {" • "}
                                              {formatDateTime(reply.createdAt)}
                                            </p>
                                            <p className="text-sm text-ink-soft">{reply.contentMd}</p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-ink-muted">Комментариев пока нет.</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Textarea
                                placeholder="Напишите комментарий..."
                                className="min-h-[84px] resize-y"
                                value={commentDrafts[post.id] ?? ""}
                                onChange={(event) =>
                                  setCommentDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))
                                }
                              />
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => handleSubmitComment(post.id)}
                                  disabled={commentMutation.isPending}
                                >
                                  <SendHorizontal className="h-4 w-4" />
                                  Отправить
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </section>
                    ) : null}
                  </article>
                )
              })
            )}
          </div>

          {showSidePanels ? (
            <aside className="space-y-4">
              <section className="rounded-xl border border-brand-soft bg-white/90 p-4">
                <h3 className="text-base font-semibold text-ink-strong">Ближайшие события</h3>
                <div className="mt-3 space-y-3">
                  {isEventsLoading ? (
                    Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-20 rounded-lg" />)
                  ) : (
                    events.map((event) => (
                      <article key={event.id} className="rounded-lg border border-brand-soft/60 bg-background p-3">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline">{eventFormatLabel(event.format)}</Badge>
                          <span className="text-xs text-ink-muted">{event._count.registrations} участников</span>
                        </div>
                        <h4 className="mt-2 line-clamp-2 text-sm font-semibold text-ink-strong">{event.title}</h4>
                        <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{event.description}</p>
                        <p className="mt-2 inline-flex items-center gap-1 text-xs text-ink-muted">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {formatDateTime(event.startAt)}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-brand-soft bg-white/90 p-4">
                <h3 className="text-base font-semibold text-ink-strong">Активные проекты</h3>
                <div className="mt-3 space-y-3">
                  {isProjectsLoading ? (
                    Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-20 rounded-lg" />)
                  ) : (
                    projects.map((project) => (
                      <article key={project.id} className="rounded-lg border border-brand-soft/60 bg-background p-3">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="secondary">{projectStatusLabel(project.status)}</Badge>
                          <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                            <Users className="h-3.5 w-3.5" />
                            {project._count.members}
                          </span>
                        </div>
                        <h4 className="mt-2 line-clamp-2 text-sm font-semibold text-ink-strong">{project.title}</h4>
                        <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{project.summary}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {project.demoUrl ? (
                            <Button asChild size="xs" variant="outline" className="gap-1">
                              <Link href={project.demoUrl} target="_blank" rel="noreferrer">
                                Demo
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          ) : null}
                          {project.repoUrl ? (
                            <Button asChild size="xs" variant="outline" className="gap-1">
                              <Link href={project.repoUrl} target="_blank" rel="noreferrer">
                                Repo
                                <Rocket className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          ) : null}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </aside>
          ) : null}
        </div>
      </section>
    </section>
  )
}
