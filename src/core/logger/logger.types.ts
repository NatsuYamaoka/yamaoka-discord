import { ValueOf } from "@app/common/types/valueOf";
import { DefaultColors } from "./constants/log-colors.const";

export type _LogLevels = "log" | "error" | "warn" | "info";

export type LogLevels = {
  [key in _LogLevels]: _LogLevels;
};

export type LogLevel = _LogLevels | ValueOf<LogLevels>;

export type LogColors = {
  [key in _LogLevels]: ValueOf<typeof DefaultColors>;
};

export interface LogOptions {
  customColor?: CustomLogColor;
  prefix?: string;
  icon?: string;
  trace?: boolean;
}

export type CustomLogColor = `#${string}`;
