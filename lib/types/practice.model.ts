import type { Id, IsoDateString } from "./common";
import type { SubmissionStatus } from "./enums";

export interface IPracticeTask {
  id: Id;
  courseId: Id;

  title: string;
  statementMd: string;

  maxScore: number;
  timeLimitMs?: number | null;
  memoryLimitMb?: number | null;
  externalRef?: string | null;

  order: number;

  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

export interface IPracticeSubmission {
  id: Id;
  practiceTaskId: Id;
  userId: Id;

  answerText?: string | null;

  status: SubmissionStatus;
  score?: number | null;
  comment?: string | null;

  checkedAt?: IsoDateString | null;
  checkedById?: Id | null;

  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}
