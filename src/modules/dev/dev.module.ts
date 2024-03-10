import { Base } from "@abstracts/client/client.abstract";
import { Module } from "@decorators/module.decorator";
import ScraperStatusCommand from "@modules/dev/message-commands/scraper-status.command";
import LoadSlashesCommand from "@modules/dev/message-commands/scraper-status.command";

@Module({
  commands: [LoadSlashesCommand, ScraperStatusCommand],
})
export class DevModule extends Base {}
