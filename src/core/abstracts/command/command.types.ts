import {
  ChatInputCommandInteraction,
  Message,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";

export enum CommandType {
  SLASH_COMMAND = "SLASH_COMMAND",
  MESSAGE_COMMAND = "MESSAGE_COMMAND",
}

export type AllowedUsersOrRolesType = string | undefined;

export type CommandOptions<T extends CommandType> =
  T extends CommandType.SLASH_COMMAND
    ? SlashCommandOptions
    : MessageCommandOptions;

export type CommandArguments<T extends CommandType> =
  T extends CommandType.SLASH_COMMAND ? ChatInputCommandInteraction : Message;

type SharedCommandOptions = {
  name: string;
  requiredRegistration?: boolean;
};

type SlashCommandOptions = SharedCommandOptions & {
  data: RESTPostAPIApplicationCommandsJSONBody;
};

type MessageCommandOptions = SharedCommandOptions & {
  allowedUsersOrRoles: AllowedUsersOrRolesType[];
};
