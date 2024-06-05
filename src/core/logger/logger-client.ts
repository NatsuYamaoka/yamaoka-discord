/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogColorsEnum } from "@app/core/logger/constants/log-colors.const";
import { LogLevelsEnum } from "@app/core/logger/constants/log-levels.const";
import {
  CustomLogColor,
  LogLevel,
  LogOptions,
} from "@app/core/logger/logger.types";
import chalk from "chalk";

export class Logger {
  private __log = console.log;

  private generatedIcons = {
    [LogLevelsEnum.info]: "i",
    [LogLevelsEnum.log]: "l",
    [LogLevelsEnum.warn]: "!",
    [LogLevelsEnum.error]: "!!!",
  };

  public log(msg: any, options?: LogOptions) {
    this._log(LogLevelsEnum.log, msg, options);
  }

  public error(msg: any, options?: LogOptions) {
    this._log(LogLevelsEnum.error, msg, {
      trace: options?.trace ?? true,
      ...options,
    });
  }

  public warn(msg: any, options?: LogOptions) {
    this._log(LogLevelsEnum.warn, msg, options);
  }

  public info(msg: any, options?: LogOptions) {
    this._log(LogLevelsEnum.info, msg, options);
  }

  private formLogMessageByTemplate(
    level: LogLevel,
    msg: string,
    options?: LogOptions
  ) {
    const icon = options?.icon ?? this.generatedIcons[level];
    const prefix = options?.prefix ?? "";

    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    return `[${date} - ${time} | ${icon} ${prefix}]: ${msg}`;
  }

  private useColor(level: LogLevel, color?: CustomLogColor) {
    return chalk.hex(color ?? LogColorsEnum[level]);
  }

  private _log(level: LogLevel, msg: string, opt?: LogOptions) {
    const color = this.useColor(level, opt?.customColor);
    const formdLog = this.formLogMessageByTemplate(level, msg, opt);

    this.__log(color(formdLog));
    if (opt?.trace) {
      console.trace(msg);
    }
  }
}
export const logger = new Logger();
