import type { Id, IsoDateString } from "./common";

export interface ITheory {
  id: Id;
  courseId: Id;

  title: string;
  contentMd: string;
  order: number;

  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}
