import { Base } from "@abstracts/client/client.abstract";
import {
  AllowedUsersOrRolesType,
  CmdArg,
  CmdType,
  MessageCommandType,
  SlashCommandType,
} from "@abstracts/command/command.types";
import { ModuleAbstract } from "@abstracts/module/module.abstract";
import { IsSlashCommand } from "@app/common/types/guards.types";
import { logger } from "@app/core/logger/logger-client";
import { CustomClient } from "@client/custom-client";
import {
  MessageCommandsMap,
  SlashCommandMap,
} from "@managers/command/command-manager.types";

export class CommandManager extends Base {
  constructor(client: CustomClient) {
    super(client);

    logger.log("Command Manager inited");
  }

  public slashCommands: SlashCommandMap = new Map();
  public messageCommands: MessageCommandsMap = new Map();

  public loadCommands(module: ModuleAbstract) {
    if (!module.commands) {
      return;
    }

    for (const Command of module.commands) {
      const commandInstance = new Command(this.client);

      if (!commandInstance.options) {
        logger.log(`No options was found for ${Command.name}, skipping`);
        continue;
      }

      const { name } = commandInstance.options;

      if ("data" in commandInstance.options) {
        this.slashCommands.set(name, commandInstance as SlashCommandType);
      } else {
        this.messageCommands.set(name, commandInstance as MessageCommandType);
      }
    }
  }

  public async executeCommand<T extends CmdType>(
    cmdName: string,
    cmdArg: CmdArg<T>
  ) {
    const command = IsSlashCommand(cmdArg)
      ? this.slashCommands.get(cmdName)
      : this.messageCommands.get(cmdName);

    try {
      if (!command) {
        return;
      }

      if (IsSlashCommand(cmdArg)) {
        await this.executeSlashCommand(cmdArg, command as SlashCommandType);
      } else {
        await this.executeMessageCommand(cmdArg, command as MessageCommandType);
      }
    } catch (err) {
      logger.error(err);
      command?.sendError(
        `Не волнуйтесь, в этот раз напортачили мы.\n\nУведомление о проблеме уже было отправлено и мы постараемся исправить её как можно скорее.`,
        cmdArg as never,
        "https://i.imgur.com/Mvk0XVh.png"
      );
    }
  }

  public async checkPermissions(
    allowedUsersOrRoles: AllowedUsersOrRolesType[],
    commandArgument: CmdArg<CmdType.MESSAGE_COMMAND>
  ) {
    if (allowedUsersOrRoles.includes(commandArgument.author.id)) {
      return true;
    }

    const fetchedMember = await commandArgument.member?.fetch();

    if (!fetchedMember) {
      return false;
    }

    if (
      allowedUsersOrRoles.some((val) =>
        val !== undefined ? fetchedMember.roles.cache.has(val) : null
      )
    ) {
      return true;
    }
  }

  private async executeSlashCommand(
    arg: CmdArg<CmdType.SLASH_COMMAND>,
    command: SlashCommandType
  ) {
    await command.execute(arg);
  }

  private async executeMessageCommand(
    arg: CmdArg<CmdType.MESSAGE_COMMAND>,
    command: MessageCommandType
  ) {
    if (!command.options) {
      return;
    }

    const checkedPermissions = await this.checkPermissions(
      command.options.allowedUsersOrRoles,
      arg
    );

    if (!checkedPermissions) {
      return arg.reply("You don't have enough permissions to use this command");
    }

    await command.execute(arg);
  }
}
