import { logger } from "@app/core/logger/logger-client";

export const handleUncaughtException = (error: Error) => {
  logger.error(`${error.message}`);
  console.error(error);

  process.exit(1);
};
export const handleUnhandledRejection = (error: Error) => {
  logger.error(`${error.message}`);
  console.error(error);
};
