import type { Id, IsoDateString } from "./common";
import type { Role } from "./enums";

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
}

export interface IUpdateUserDto {
  name?: string;
  avatarUrl?: string | null;
}

export type TypeUserForm = Omit<IUser,'id'> & {password?:string} 