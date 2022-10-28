import {
  ChatInputCommandInteraction,
  Message,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";

export type AllowedUsersOrRolesType = string | undefined;

export enum CommandType {
  SLASH_COMMAND = "SLASH_COMMAND",
  MESSAGE_COMMAND = "MESSAGE_COMMAND",
}

interface SlashCommandOptions {
  name: string;
  data: RESTPostAPIApplicationCommandsJSONBody;
}

interface MessageCommandOptions {
  name: string;
  allowedUsersOrRoles: AllowedUsersOrRolesType[];
}

export type CommandOptions<T extends CommandType> =
  T extends CommandType.SLASH_COMMAND
    ? SlashCommandOptions
    : MessageCommandOptions;

export type CommandArguments<T extends CommandType> =
  T extends CommandType.SLASH_COMMAND ? ChatInputCommandInteraction : Message;
