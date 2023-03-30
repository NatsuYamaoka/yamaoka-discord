import { CompletedQuizEntity } from "@entities/index";

export const getQuizStats = (option: GetQuizStatsOptions) => {
  const { completedQuizes } = option;

  const totalAttempts = completedQuizes.length;
  const totalSuccessfulAttempts = completedQuizes.filter(
    (cq) => !cq.is_failed
  ).length;

  const totalFailedAttempts = totalAttempts - totalSuccessfulAttempts;

  const attemptedUsers = getAttemptedUsers(completedQuizes);
  const {
    userWithMostAttempts,
    userWithMostFailedAttempts,
    userWithMostSuccessfulAttempts,
  } = getTopUsers(attemptedUsers);

  return {
    totalAttempts,
    totalSuccessfulAttempts,
    totalFailedAttempts,
    attemptedUsers,
    userWithMostAttempts,
    userWithMostSuccessfulAttempts,
    userWithMostFailedAttempts,
  };
};

export const getAttemptedUsers = (
  completedQuizes: CompletedQuizEntity[]
): GetQuizStatsAttemptedUsers[] => {
  const mostAttemptsCollected =
    completedQuizes.reduce<GetQuizStatsMostAttempts>((prev, curr) => {
      const amount = prev[curr.user.uid];

      if (!amount) {
        prev[curr.user.uid] = {
          totalAttempts: 1,
          successfulAttempts: !curr.is_failed ? 1 : 0,
          failedAttempts: !curr.is_failed ? 0 : 1,
        };
      } else {
        prev[curr.user.uid] = {
          totalAttempts: amount.totalAttempts + 1,
          successfulAttempts:
            amount.successfulAttempts + (!curr.is_failed ? 1 : 0),
          failedAttempts: amount.failedAttempts + (!curr.is_failed ? 0 : 1),
        };
      }

      return prev;
    }, {});

  return Object.keys(mostAttemptsCollected).map((uid) => {
    const attempts = mostAttemptsCollected[uid];

    return {
      uid,
      totalAttempts: attempts.totalAttempts,
      successfulAttempts: attempts.successfulAttempts,
      failedAttempts: attempts.failedAttempts,
    };
  });
};

export const getTopUsers = (attemptedUsers: GetQuizStatsAttemptedUsers[]) => {
  const sortFunc = (
    a: GetQuizStatsAttemptedUsers,
    b: GetQuizStatsAttemptedUsers
  ) => a.totalAttempts - b.totalAttempts;

  const userWithMostAttempts = [...attemptedUsers].sort(sortFunc)[0];
  const userWithMostSuccessfulAttempts = [...attemptedUsers].sort(sortFunc)[0];
  const userWithMostFailedAttempts = [...attemptedUsers].sort(sortFunc)[0];

  return {
    userWithMostAttempts,
    userWithMostSuccessfulAttempts,
    userWithMostFailedAttempts,
  };
};

interface GetQuizStatsOptions {
  completedQuizes: CompletedQuizEntity[];
}

interface GetQuizStatsMostAttempts {
  [key: string]: GetQuizStatsAttemptsCount;
}

interface GetQuizStatsAttemptedUsers extends GetQuizStatsAttemptsCount {
  uid: string;
}

interface GetQuizStatsAttemptsCount {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
}
