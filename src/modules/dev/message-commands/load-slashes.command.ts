import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { logger } from "@app/core/logger/logger-client";
import { MessageCommand } from "@decorators/commands.decorator";
import { REST, Routes } from "discord.js";

@MessageCommand({
  name: "load-slashes",
  allowedUsersOrRoles: [process.env.OWNER],
})
export default class LoadSlashesCommand extends BaseCommand<CmdType.MESSAGE_COMMAND> {
  public async execute(arg: CmdArg<CmdType.MESSAGE_COMMAND>) {
    const slashCommands = this.client.commandManager.slashCommands;
    const commandsData = [...slashCommands.values()].map(
      (cmd) => cmd.options?.data
    );

    if (!process.env.TOKEN || !process.env.CLIENTID) {
      logger.error(
        "Cannot load ( / ) commands, no TOKEN or CLIENTID was found in env"
      );

      return process.exit();
    }

    if (!commandsData.length) return;

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    logger.info("( / ) Clearing application commands");

    await rest.put(Routes.applicationCommands(process.env.CLIENTID), {
      body: [],
    });

    logger.info("( / ) Preparing for application commands update");

    await rest.put(Routes.applicationCommands(process.env.CLIENTID), {
      body: commandsData,
    });

    logger.info("( / ) Application commands update finished");

    arg.reply({ content: "( / ) commands realoded!" });
  }
}
