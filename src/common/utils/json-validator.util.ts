import { logger } from "@app/core/logger/logger-client";

export function isValidJson(str: string) {
  try {
    const parsedJson = JSON.parse(str);

    if (parsedJson && typeof parsedJson === "object") {
      return true;
    }
  } catch (err) {
    logger.error(err);
  }
  return false;
}
