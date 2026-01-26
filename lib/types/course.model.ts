import type { Id, IsoDateString } from "./common";
import type { Status, CourseScope } from "./enums";

export interface ICourse {
  id: Id;
  title: string;
  slug: string;
  description: string;

  status: Status;
  scope: CourseScope;

  authorId: Id;

  universityId?: Id | null;
  teamId?: Id | null;

  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}
