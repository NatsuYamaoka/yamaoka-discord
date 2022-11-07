import { CompletedQuiz } from "../../../entities";

export interface GetQuizStatsOptions {
  completedQuizes: CompletedQuiz[];
}

export interface IMostAttempts {
  [key: string]: AttemptsCount;
}

export interface AttemptedUsers extends AttemptsCount {
  uid: string;
}

export interface AttemptsCount {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
}
