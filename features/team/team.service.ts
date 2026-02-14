import { axiosWithAuth } from "@/lib/api/interceptors";
import { ITeam, ITeamJoinRequest, ITeamMember } from "@/lib/types";

export const TeamService = {
    async getMeTeam(): Promise<ITeam>{
        const response = await axiosWithAuth.get<ITeam>('/team/me')
        return response.data
    },

    async getTeamMembers():Promise<ITeamMember[]>{
        const res = await axiosWithAuth.get<ITeamMember[]>('/team/me/members')
        return res.data
    },

    async getJoinRequest():Promise<ITeamJoinRequest[]>{
        const res = await axiosWithAuth.get<ITeamJoinRequest[]>('/team/join-requests/incoming')
        return res.data
    },

    async getAllTeams():Promise<ITeam[]>{
        const res = await axiosWithAuth.get<ITeam[]>('/team')
        return res.data
    },

    async deleteTeamMember(teamId: string, userId: string): Promise<boolean> {
        const res = await axiosWithAuth.delete<{ ok: boolean }>(
            `/team/${teamId}/members/${userId}`
        )
        return res.data.ok
    },

    async deleteTeam(teamId:string):Promise<boolean>{
        const res = await axiosWithAuth.delete<{ok:boolean}>(`/admin/teams/${teamId}`)
        return res.data.ok
    },

    async approveJoinRequest(joinRequestId:string):Promise<ITeamJoinRequest>{
        const res = await axiosWithAuth.patch<ITeamJoinRequest>(`/team/join-requests/${joinRequestId}/approve`)
        return res.data
    },

    async rejectJoinRequest(joinRequestId:string):Promise<ITeamJoinRequest>{
        const res = await axiosWithAuth.patch<ITeamJoinRequest>(`/team/join-requests/${joinRequestId}/approve`)
        return res.data
    },

    async sendJoinRequest(teamId: string) {
        const res = await axiosWithAuth.post(`/team/${teamId}/join-request`)
        return res.data
    },

    async createTeam(payload: { name: string; description?: string | null }) {
        const res = await axiosWithAuth.post("/team", payload)
        return res.data
    },
    async updateTeam(teamId: string, dto: { name: string; description: string }) {
  const res = await axiosWithAuth.patch(`/team/${teamId}`, dto)
  return res.data
}
}