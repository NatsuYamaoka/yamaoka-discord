import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { MessageCommand } from "@decorators/commands.decorator";

@MessageCommand({
  name: "scraper-status",
  allowedUsersOrRoles: [process.env.OWNER],
})
export default class ScraperStatusCommand extends BaseCommand<CmdType.MESSAGE_COMMAND> {
  public async execute(message: CmdArg<CmdType.MESSAGE_COMMAND>) {
    const scrapperStats = this.client.messageScrapper.getCurrentStatus();

    if (!scrapperStats.isRunning) {
      return message.reply("Scrapper is not running");
    }

    message.reply(
      `Scrapper is running. ⚙️\n\n` +
        `Current channel: [${scrapperStats.channels.updated}/${scrapperStats.channels.total}]\n` +
        `Users to process: ${scrapperStats.users.total}\nUsers processed: ${scrapperStats.users.updated}`
    );
  }
}
