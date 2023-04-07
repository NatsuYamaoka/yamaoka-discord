import { logger } from "@app/core/logger/logger-client";

function Log(error: Error) {
  logger.error(`${error.message}`);

  process.exit(1);
}

export const handleUncaughtException = Log;
export const handleUnhandledRejection = Log;
