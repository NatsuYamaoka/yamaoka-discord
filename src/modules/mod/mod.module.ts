import { Base } from "@abstracts/client/client.abstract";
import { Module } from "@decorators/module.decorator";
import { GiveCommand } from "@modules/mod/slash-commands/give";

@Module({
  commands: [GiveCommand],
})
export class ModModule extends Base {}
