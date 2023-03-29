import {
  MessageCommandType,
  SlashCommandType,
} from "@abstracts/command/command.types";

export type SlashCommandMap = Map<string, SlashCommandType>;
export type MessageCommandsMap = Map<string, MessageCommandType>;
