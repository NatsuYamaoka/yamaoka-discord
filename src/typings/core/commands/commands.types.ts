import {
  ChatInputCommandInteraction,
  Message,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";
import { CommandType } from "../../enums";

export type AllowedUsersOrRolesType = string | undefined;

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
