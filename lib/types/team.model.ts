import type { Id, IsoDateString } from "./common";
import type { State, JoinRequestStatus } from "./enums";

export interface ITeam {
  id: Id;
  status: State;

  name: string;
  avatarUrl?: string | null;
  leaderUserId: Id;
  description?: string | null;

  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

export interface ITeamJoinRequest {
  id: Id;
  status: JoinRequestStatus;

  teamId: Id;
  userId: Id;

  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}
