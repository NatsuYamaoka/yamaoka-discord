import { Base } from "@abstracts/client/client.abstract";
import { Module } from "@decorators/module.decorator";
import { ProfileCommand } from "@modules/general/slash-commands/profile.command";

@Module({
  commands: [ProfileCommand],
})
export class GeneralModule extends Base {}
