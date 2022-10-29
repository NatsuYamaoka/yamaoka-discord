import { Message } from "discord.js";
import { loadSlashCommands } from "../../../helpers/utils";
import { BaseCommand } from "../../core/base/base.command";
import { CommandType } from "../../typings/base-command.types";

export default class LoadedSlashesCommand extends BaseCommand<CommandType.MESSAGE_COMMAND> {
  public options = {
    name: "load-slashes",
    allowedUsersOrRoles: [process.env.OWNER],
  };

  public async execute(argument: Message<boolean>) {
    const slashCommands = this.yamaokaClient.commandManager.slashCommands;
    const commandsData = slashCommands.map(({ options }) => options.data);

    await loadSlashCommands(commandsData);

    argument.reply({ content: "( / ) commands realoded!" });
  }
}
