import { LogColors } from "@app/core/logger/logger.types";

export const DefaultColors = {
  white: "#ffffff",
  light_red: "#ff9999",
  light_green: "#adff99",
  light_cyan: "#99d3ff",
  light_yellow: "#fcff99",
} as const;

export const LogColorsEnum = {
  error: DefaultColors.light_red,
  info: DefaultColors.light_green,
  log: DefaultColors.light_cyan,
  warn: DefaultColors.light_yellow,
} satisfies LogColors;
