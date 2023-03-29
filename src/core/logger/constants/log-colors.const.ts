import { DefaultColors } from "@app/core/logger/constants/default-colors.const";
import { LogColors } from "@app/core/logger/logger.types";

export const LogColorsEnum = {
  error: DefaultColors.light_red,
  info: DefaultColors.light_green,
  log: DefaultColors.light_cyan,
  warn: DefaultColors.light_yellow,
} satisfies LogColors;
