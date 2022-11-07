import { Message, REST, Routes } from "discord.js";
import { BaseCommand } from "../../core";
import { CommandType } from "../../typings/enums";

export default class LoadedSlashesCommand extends BaseCommand<CommandType.MESSAGE_COMMAND> {
  public options = {
    name: "load-slashes",
    allowedUsersOrRoles: [process.env.OWNER],
  };

  public async execute(argument: Message<boolean>) {
    const slashCommands = this.yamaokaClient.commandManager.slashCommands;
    const commandsData = slashCommands.map(({ options }) => options.data);

    if (!process.env.TOKEN)
      throw new Error("Cannot load ( / ) commands, no TOKEN in env");

    const rest = new REST({
      version: "10",
    }).setToken(process.env.TOKEN);

    console.log("( / ) Clearing application commands...");

    await rest.put(Routes.applicationCommands(process.env.CLIENTID!), {
      body: [],
    });

    console.log("( / ) Preparing for application commands update...");
    console.log("( / ) Application commands update started...");

    await rest.put(Routes.applicationCommands(process.env.CLIENTID!), {
      body: commandsData,
    });

    console.log("( / ) Application commands update finished...");

    argument.reply({
      content: "( / ) commands realoded!",
    });
  }
}
