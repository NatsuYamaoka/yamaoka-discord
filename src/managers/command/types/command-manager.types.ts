import { BaseCommand } from "../../../core/abstracts/command/command.abstract";
import { CommandType } from "../../../core/abstracts/command/command.types";

export type SlashCommandObject = {
  [k: string]: BaseCommand<CommandType.SLASH_COMMAND>;
};

export type MessageCommandsObject = {
  [k: string]: BaseCommand<CommandType.MESSAGE_COMMAND>;
};
