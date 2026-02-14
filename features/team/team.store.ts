import { create } from 'zustand'

interface TeamMemberState {
  teamMembers: number
  setTeamMembers: (countTeamMembersby: number) => void
  teamRating:number
  setTeamRating: (ratingTeam:number) => void
  isMemberTeam:boolean
  setIsMemberTeam: (value: boolean) => void
  isTeamLeader:boolean
  setIsTeamLeader:(value:boolean) => void
  topInRatingMember:number
  setTopInRatingMember: (value: number) => void
}

export const useTeamStore = create<TeamMemberState>((set) => ({
  teamMembers:0,
  setTeamMembers: (countTeamMembers) => set(()=>({teamMembers:countTeamMembers})),
  teamRating:0,
  setTeamRating: (ratingTeam) => set(()=>({teamRating:ratingTeam})),
  isMemberTeam:false,
  setIsMemberTeam: (value) => set({ isMemberTeam: value }),
  isTeamLeader:false,
  setIsTeamLeader: (value) => set({ isTeamLeader:value}),
  topInRatingMember:0,
  setTopInRatingMember: (value) => set({ topInRatingMember: value }),
}))