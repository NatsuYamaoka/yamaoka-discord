import { CompletedQuiz } from "../yamaoka/entities";

export const getQuizStats = (option: GetQuizStatsOptions) => {
  const { completedQuizes } = option;

  const totalAttempts = completedQuizes.length;
  const totalSuccessfulAttempts = completedQuizes.filter(
    (cq) => !cq.isFailed
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
  completedQuizes: CompletedQuiz[]
): AttemptedUsers[] => {
  const mostAttemptsCollected = completedQuizes.reduce<IMostAttempts>(
    (prev, curr) => {
      const amount = prev[curr.user.uid];

      if (!amount) {
        prev[curr.user.uid] = {
          totalAttempts: 1,
          successfulAttempts: !curr.isFailed ? 1 : 0,
          failedAttempts: !curr.isFailed ? 0 : 1,
        };
      } else {
        prev[curr.user.uid] = {
          totalAttempts: amount.totalAttempts + 1,
          successfulAttempts:
            amount.successfulAttempts + (!curr.isFailed ? 1 : 0),
          failedAttempts: amount.failedAttempts + (!curr.isFailed ? 0 : 1),
        };
      }

      return prev;
    },
    {}
  );

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

export const getTopUsers = (attemptedUsers: AttemptedUsers[]) => {
  const sortFunc = (a: AttemptedUsers, b: AttemptedUsers) =>
    a.totalAttempts - b.totalAttempts;

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
  completedQuizes: CompletedQuiz[];
}

interface IMostAttempts {
  [key: string]: AttemptsCount;
}

interface AttemptedUsers extends AttemptsCount {
  uid: string;
}

interface AttemptsCount {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
}
