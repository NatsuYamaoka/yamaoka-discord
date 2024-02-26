import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { logger } from "@app/core/logger/logger-client";
import { MessageCommand } from "@decorators/commands.decorator";
import { REST, Routes } from "discord.js";

@MessageCommand({
  name: "loadcommands",
  allowedUsersOrRoles: [process.env.OWNER],
})
export default class LoadSlashesCommand extends BaseCommand<CmdType.MESSAGE_COMMAND> {
  public async execute(message: CmdArg<CmdType.MESSAGE_COMMAND>) {
    const slashCommands = this.client.commandManager.slashCommands;
    const commandsData = [...slashCommands.values()].map(
      (cmd) => cmd.options?.data
    );

    if (!process.env.TOKEN || !process.env.CLIENTID || !process.env.GUILDID) {
      logger.error(
        "Cannot load ( / ) commands, no TOKEN or CLIENTID/GUILDID was found in env"
      );

      return;
    }

    if (!commandsData.length) {
      return logger.warn("No ( / ) commands was found! Aborting process");
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENTID,
          process.env.GUILDID
        ),
        { body: commandsData }
      );

      logger.info("( / ) Guild commands update finished");

      message.react("👌").catch((err) => {});
    } catch (err) {
      logger.error(err);
    }
  }
}
