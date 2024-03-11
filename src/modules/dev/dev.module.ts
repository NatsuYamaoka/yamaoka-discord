import { Base } from "@abstracts/client/client.abstract";
import { Module } from "@decorators/module.decorator";
import LoadSlashesCommand from "@modules/dev/message-commands/load-slashes.command";
import ScraperStatusCommand from "@modules/dev/message-commands/scraper-status.command";

@Module({
  commands: [LoadSlashesCommand, ScraperStatusCommand],
})
export class DevModule extends Base {}
