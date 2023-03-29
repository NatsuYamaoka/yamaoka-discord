import { Base } from "@abstracts/client/client.abstract";
import { Module } from "@decorators/module.decorator";
import LoadSlashesCommand from "@modules/dev/message-commands/load-slashes.command";

@Module({
  commands: [LoadSlashesCommand],
})
export class DevModule extends Base {}
