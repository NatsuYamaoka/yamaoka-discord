import { Collection, Message } from "discord.js";
import { join } from "path";
import { Base, BaseCommand } from "../core";
import { searchCmdsOrEventsByPath } from "../helpers/utils";
import {
  AllowedUsersOrRolesType,
  CommandArguments,
  MessageCommandsCollection,
  SlashCommandsCollection,
} from "../typings/core";

import { CommandType } from "../typings/enums";

export class CommandManager extends Base {
  public slashCommands: SlashCommandsCollection = new Collection();
  public messageCommands: MessageCommandsCollection = new Collection();

  public async loadCommands() {
    const rootDir = this.yamaokaClient.rootDir;
    const path = join(process.cwd(), "/", rootDir, "commands", "**");
    const result = await searchCmdsOrEventsByPath<typeof BaseCommand>(path);

    if (!result) return;

    const { files, totalLoaded } = result;

    for (const Command of files) {
      const commandInstance = new Command(this.yamaokaClient);
      const { options } = commandInstance;

      "data" in options
        ? this.slashCommands.set(options.name, commandInstance)
        : this.messageCommands.set(options.name, commandInstance);
    }

    console.log(
      `✅ ${totalLoaded} COMMANDS WAS LOADED!\n( / ): ${this.slashCommands.size} | ( M ): ${this.messageCommands.size}`
    );
  }

  public async executeCommand(
    commandName: string,
    commandArgument: CommandArguments<CommandType>,
    isSlash: CommandType
  ) {
    try {
      const command =
        isSlash === CommandType.SLASH_COMMAND
          ? this.slashCommands.find(
              ({ options }) => options.name === commandName
            )
          : this.messageCommands.find(
              ({ options }) => options.name === commandName
            );

      if (!command) return;

      if (
        "allowedUsersOrRoles" in command.options &&
        commandArgument instanceof Message
      ) {
        const result = await this.checkPermissions(
          command.options.allowedUsersOrRoles,
          commandArgument
        );

        if (!result)
          return commandArgument.reply({
            content: "👀 You are not whitelisted for this command!",
          });
      }

      //@ts-ignore
      await command.execute(commandArgument);
    } catch (err) {
      console.log(`⚠️ ERROR WHEN TRYING EXECUTE ${commandName} COMMAND.`);
      console.log(err);
    }
  }

  public async checkPermissions(
    allowedUsersOrRoles: AllowedUsersOrRolesType[],
    commandArgument: CommandArguments<CommandType.MESSAGE_COMMAND>
  ) {
    if (allowedUsersOrRoles.includes(commandArgument.author.id)) return true;

    const fetchedMember = await commandArgument.member?.fetch();

    if (!fetchedMember) return false;
    if (
      allowedUsersOrRoles.some((val) =>
        val !== undefined ? fetchedMember.roles.cache.has(val) : null
      )
    )
      return true;
  }
}
