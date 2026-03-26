import { axiosWithAuth } from "@/lib/api/interceptors"

import type { UniversityGroupItem, UniversityItem, UniversityMembershipItem } from "./university.types"

export const UniversityService = {
  async getAll(): Promise<UniversityItem[]> {
    const res = await axiosWithAuth.get<UniversityItem[]>("/university")
    return res.data
  },

  async getMy(): Promise<UniversityMembershipItem[]> {
    const res = await axiosWithAuth.get<UniversityMembershipItem[]>("/university/my")
    return res.data
  },

  async getBySlug(slug: string): Promise<UniversityItem> {
    const res = await axiosWithAuth.get<UniversityItem>(`/university/${slug}`)
    return res.data
  },

  async getGroups(universityId: string): Promise<UniversityGroupItem[]> {
    const res = await axiosWithAuth.get<UniversityGroupItem[]>(`/university/${universityId}/groups`)
    return res.data
  },
}
