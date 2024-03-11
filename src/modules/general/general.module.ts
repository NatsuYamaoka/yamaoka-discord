import { Base } from "@abstracts/client/client.abstract";
import { Module } from "@decorators/module.decorator";
import { ProfileCommand } from "@modules/general/slash-commands/profile.command";
import { SetProfileCommand } from "./slash-commands/set-profile.command";

@Module({
  commands: [ProfileCommand, SetProfileCommand],
})
export class GeneralModule extends Base {}
