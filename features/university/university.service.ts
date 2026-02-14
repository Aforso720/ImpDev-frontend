
import { axiosWithAuth } from "@/lib/api/interceptors"
import type { UniversityItem } from "./university.types"

export const UniversityService = {
  async getAll(): Promise<UniversityItem[]> {
    const res = await axiosWithAuth.get<UniversityItem[]>("/university")
    return res.data
  },

  async getBySlug(slug: string): Promise<UniversityItem> {
    const res = await axiosWithAuth.get<UniversityItem>(`/university/${slug}`)
    return res.data
  },
}
