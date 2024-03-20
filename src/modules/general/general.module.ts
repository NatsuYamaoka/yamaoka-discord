import { Base } from "@abstracts/client/client.abstract";
import { Module } from "@decorators/module.decorator";
import { ProfileCommand } from "@modules/general/slash-commands/profile.command";
import { SetProfileCommand } from "@modules/general/slash-commands/set-profile.command";
import { LeaderboardCommand } from "@modules/general/slash-commands/leaderboard.command";

@Module({
  commands: [ProfileCommand, SetProfileCommand, LeaderboardCommand],
})
export class GeneralModule extends Base {}
