import type { Id, IsoDateString } from "./common";
import type { MembershipStatus, Role, UniversityRole } from "./enums";

export interface IUserUniversityMembership {
  id: Id;
  universityId: Id;
  userId: Id;
  role: UniversityRole;
  status: MembershipStatus;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

export interface IUser {
  id: Id;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: Role;

  createdAt: IsoDateString;
  updatedAt: IsoDateString;

  universityId?: Id | null;
  teamId?: Id | null;
  universityMemberships?: IUserUniversityMembership[];
}

export interface IUpdateUserDto {
  name?: string;
  avatarUrl?: string | null;
}

export type TypeUserForm = Omit<IUser,'id'> & {password?:string} 
