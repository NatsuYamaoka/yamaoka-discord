import { Collection } from "discord.js";
import { BaseCommand } from "../../../core/base/base.command";
import { CommandType } from "../../enums";

export type SlashCommandsCollection = Collection<
  string,
  BaseCommand<CommandType.SLASH_COMMAND>
>;

export type MessageCommandsCollection = Collection<
  string,
  BaseCommand<CommandType.MESSAGE_COMMAND>
>;

export interface PaginationManagerOptions {
  page?: number;
  elementsOnPage?: number;
}
