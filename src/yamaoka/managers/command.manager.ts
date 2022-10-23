import { Collection, Message } from "discord.js";
import { join } from "path";
import { importFiles } from "../../helpers/utils";
import { Base } from "../core/base/base";
import { BaseCommand } from "../core/base/base.command";
import { CommandArguments, CommandType } from "../typings/base-command.types";

export class CommandManager extends Base {
  public slashCommands: Collection<
    string,
    BaseCommand<CommandType.SLASH_COMMAND>
  > = new Collection();

  public messageCommands: Collection<
    string,
    BaseCommand<CommandType.MESSAGE_COMMAND>
  > = new Collection();

  public async loadCommands() {
    const rootDir = this.yamaokaClient.rootDir;
    const path = join(process.cwd(), "/", rootDir, "yamaoka", "commands", "**");
    const result = await importFiles<typeof BaseCommand>(path);

    if (!result) return;

    const { files, totalLoaded } = result;

    for (const Command of files) {
      const commandInstance = new Command(this.yamaokaClient);
      const { options } = commandInstance;

      if ("data" in options) {
        this.slashCommands.set(options.name, commandInstance);
      } else {
        this.messageCommands.set(options.name, commandInstance);
      }
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
    allowedUsersOrRoles: string[],
    commandArgument: CommandArguments<CommandType.MESSAGE_COMMAND>
  ) {
    if (allowedUsersOrRoles.includes(commandArgument.author.id)) return true;

    const fetchedMember = await commandArgument.member?.fetch();

    if (!fetchedMember) return false;
    if (allowedUsersOrRoles.some((val) => fetchedMember.roles.cache.has(val)))
      return true;
  }
}
