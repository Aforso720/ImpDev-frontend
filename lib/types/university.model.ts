import type { Id, IsoDateString } from "./common";

export interface IUniversity {
  id: Id;
  name: string;
  avatarUrl?: string | null;
  leaderUserId: Id;
  description?: string | null;

  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}
