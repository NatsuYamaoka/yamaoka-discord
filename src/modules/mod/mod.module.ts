import { Base } from "@abstracts/client/client.abstract";
import { Module } from "@decorators/module.decorator";
import { ProfilePresetsCommand } from "./slash-commands/profile-presets.command";

@Module({
  commands: [ProfilePresetsCommand],
})
export class ModModule extends Base {}
