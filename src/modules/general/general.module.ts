import { Base } from "@abstracts/client/client.abstract";
import { Module } from "@decorators/module.decorator";
import { ProfileCommand } from "@modules/general/slash-commands/profile.command";
import { SetProfileCommand } from "@modules/general/slash-commands/set-profile.command";
import { LeaderboardCommand } from "@modules/general/slash-commands/leaderboard.command";
import { ShopCommand } from "@modules/general/slash-commands/shop.command";
import { ProfileTokens } from "@modules/general/slash-commands/profile-tokens.command";

@Module({
  commands: [
    ProfileCommand,
    SetProfileCommand,
    LeaderboardCommand,
    ShopCommand,
    ProfileTokens,
  ],
})
export class GeneralModule extends Base {}
