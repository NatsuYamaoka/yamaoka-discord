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

  private generatedColors = {
    [LogLevelsEnum.info]: chalk.hex(LogColorsEnum.info),
    [LogLevelsEnum.log]: chalk.hex(LogColorsEnum.log),
    [LogLevelsEnum.warn]: chalk.hex(LogColorsEnum.warn),
    [LogLevelsEnum.error]: chalk.hex(LogColorsEnum.error),
  };

  private generatedIcons = {
    [LogLevelsEnum.info]: "i",
    [LogLevelsEnum.log]: "l",
    [LogLevelsEnum.warn]: "!",
    [LogLevelsEnum.error]: "!!!",
  };

  public log(msg: string, options?: LogOptions) {
    this._log(LogLevelsEnum.log, msg, options);
  }

  public error(msg: string, options?: LogOptions) {
    this._log(LogLevelsEnum.error, msg, options);
  }

  public warn(msg: string, options?: LogOptions) {
    this._log(LogLevelsEnum.warn, msg, options);
  }

  public info(msg: string, options?: LogOptions) {
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
    return !color ? this.generatedColors[level] : chalk.hex(color);
  }

  private _log(level: LogLevel, msg: string, opt?: LogOptions) {
    const color = this.useColor(level, opt?.customColor);
    const formdLog = this.formLogMessageByTemplate(level, msg, opt);

    this.__log(color(formdLog));
  }
}

export const logger = new Logger();
