import { Base } from "@abstracts/client/client.abstract";
import { Module } from "@decorators/module.decorator";
import { ProfileCommand } from "@modules/general/slash-commands/profile";
import { RegisterCommand } from "@modules/general/slash-commands/register";

@Module({
  commands: [ProfileCommand, RegisterCommand],
})
export class GeneralModule extends Base {}
