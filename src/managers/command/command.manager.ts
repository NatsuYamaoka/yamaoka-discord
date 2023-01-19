import { Message } from "discord.js";
import { join } from "path";
import { searchCmdsOrEventsByPath } from "../../common/utils/utils";
import { Base } from "../../core/abstracts/client/client.abstract";
import { BaseCommand } from "../../core/abstracts/command/command.abstract";
import {
  CommandArguments,
  CommandType,
  AllowedUsersOrRolesType,
} from "../../core/abstracts/command/types/command.types";
import {
  SlashCommandObject,
  MessageCommandsObject,
} from "./types/command-manager.types";

export class CommandManager extends Base {
  public slashCommands: SlashCommandObject = {};
  public messageCommands: MessageCommandsObject = {};

  public async loadCommands() {
    const rootDir = this.customClient.rootDir;
    const toJoinPaths = [process.cwd(), "/", rootDir, "commands", "**"];
    const commandFilesPath = join(...toJoinPaths);

    const foundCommandFiles = await searchCmdsOrEventsByPath<
      typeof BaseCommand
    >(commandFilesPath);

    if (!foundCommandFiles) return;

    for (const Command of foundCommandFiles) {
      const commandInstance = new Command(this.customClient);
      const { options } = commandInstance;

      if (!options["requiredRegistration"]) {
        options.requiredRegistration = false;
      }

      "data" in options
        ? (this.slashCommands[options.name] = commandInstance)
        : (this.messageCommands[options.name] = commandInstance);
    }
  }

  public async executeCommand(
    commandName: string,
    commandArgument: CommandArguments<CommandType>,
    isSlash: CommandType
  ) {
    try {
      const command =
        isSlash === CommandType.SLASH_COMMAND
          ? this.slashCommands[commandName]
          : this.messageCommands[commandName];

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
