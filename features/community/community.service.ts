import { axiosWithAuth } from "@/lib/api/interceptors"

import { demoEvents, demoProjects } from "./community.examples"
import type {
  CommunityPaginated,
  CreatePostCommentPayload,
  CreatePostPayload,
  EventListItem,
  EventQueryParams,
  PostCategoryItem,
  PostDetail,
  PostFeedItem,
  PostQueryParams,
  ProjectListItem,
  ProjectQueryParams,
  ReactPostPayload,
  ReactPostResponse,
  UpdatePostPayload,
} from "./community.types"

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === null) return
    searchParams.set(key, String(value))
  })

  return searchParams.toString()
}

function makeFallback<T>(items: T[], page: number, limit: number): CommunityPaginated<T> {
  return {
    items: items.slice(0, limit),
    total: items.length,
    page,
    limit,
    isDemo: true,
  }
}

const defaultPostCategories: PostCategoryItem[] = [
  { id: "fallback-news", key: "NEWS", title: "Новость", description: "Новости платформы и университетов" },
  { id: "fallback-announcement", key: "ANNOUNCEMENT", title: "Объявление", description: "Организационные объявления" },
  { id: "fallback-event", key: "EVENT", title: "Мероприятие", description: "Хакатоны, семинары, олимпиады" },
  { id: "fallback-achievement", key: "ACHIEVEMENT", title: "Достижение", description: "Результаты участников" },
  {
    id: "fallback-team-recruitment",
    key: "TEAM_RECRUITMENT",
    title: "Набор в команду",
    description: "Поиск участников в команды и проекты",
  },
]

export const CommunityService = {
  async getPosts(params: PostQueryParams = {}): Promise<CommunityPaginated<PostFeedItem>> {
    const page = params.page ?? 1
    const limit = params.limit ?? 10

    const query = buildQuery({
      page,
      limit,
      q: params.q?.trim() || undefined,
      categoryKey: params.categoryKey,
      visibility: params.visibility,
      universityId: params.universityId,
      groupId: params.groupId,
    })

    try {
      const response = await axiosWithAuth.get<CommunityPaginated<PostFeedItem>>(`/post?${query}`)
      return response.data
    } catch {
      return { items: [], total: 0, page, limit }
    }
  },

  async getPostById(postId: string): Promise<PostDetail> {
    const response = await axiosWithAuth.get<PostDetail>(`/post/${postId}`)
    return response.data
  },

  async getPostCategories(): Promise<PostCategoryItem[]> {
    try {
      const response = await axiosWithAuth.get<PostCategoryItem[]>("/post/categories")
      return response.data
    } catch {
      return defaultPostCategories
    }
  },

  async createPost(payload: CreatePostPayload): Promise<PostFeedItem> {
    const response = await axiosWithAuth.post<PostFeedItem>("/post", payload)
    return response.data
  },

  async addComment(postId: string, payload: CreatePostCommentPayload) {
    const response = await axiosWithAuth.post(`/post/${postId}/comment`, payload)
    return response.data
  },

  async reactToPost(postId: string, payload: ReactPostPayload): Promise<ReactPostResponse> {
    const response = await axiosWithAuth.post<ReactPostResponse>(`/post/${postId}/reaction`, payload)
    return response.data
  },

  async updatePost(postId: string, payload: UpdatePostPayload): Promise<PostFeedItem> {
    const response = await axiosWithAuth.patch<PostFeedItem>(`/post/${postId}`, payload)
    return response.data
  },

  async deletePost(postId: string): Promise<{ ok: boolean }> {
    const response = await axiosWithAuth.delete<{ ok: boolean }>(`/post/${postId}`)
    return response.data
  },

  async getEvents(params: EventQueryParams = {}): Promise<CommunityPaginated<EventListItem>> {
    const page = params.page ?? 1
    const limit = params.limit ?? 4

    const query = buildQuery({
      page,
      limit,
      q: params.q?.trim() || undefined,
      upcomingOnly: params.upcomingOnly ?? true,
    })

    try {
      const response = await axiosWithAuth.get<CommunityPaginated<EventListItem>>(`/event?${query}`)
      if (response.data.items.length > 0) return response.data
      return makeFallback(demoEvents, page, limit)
    } catch {
      return makeFallback(demoEvents, page, limit)
    }
  },

  async getProjects(params: ProjectQueryParams = {}): Promise<CommunityPaginated<ProjectListItem>> {
    const page = params.page ?? 1
    const limit = params.limit ?? 4

    const query = buildQuery({
      page,
      limit,
      q: params.q?.trim() || undefined,
      status: params.status,
    })

    try {
      const response = await axiosWithAuth.get<CommunityPaginated<ProjectListItem>>(`/project?${query}`)
      if (response.data.items.length > 0) return response.data
      return makeFallback(demoProjects, page, limit)
    } catch {
      return makeFallback(demoProjects, page, limit)
    }
  },
}
