import {
  ChatInputCommandInteraction,
  codeBlock,
  SlashCommandBuilder,
} from "discord.js";
import { BaseCommand } from "../../core/base/base.command";
import { User } from "../../entities";
import { CommandType } from "../../typings/base-command.types";
import { embeds } from "../../../configs/yamaoka/config.json";

export default class MeCommand extends BaseCommand<CommandType.SLASH_COMMAND> {
  public options = {
    name: "me",
    data: new SlashCommandBuilder()
      .setName("me")
      .setDescription("Shows information about you or user!")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Select user if you wanna check info about him")
      )
      .toJSON(),
  };

  public async execute(argument: ChatInputCommandInteraction) {
    const user = argument.options.getUser("user") || argument.user;
    const userData = await User.findOne({
      where: {
        uid: user.id,
      },
      relations: {
        wallet: true,
      },
    });

    if (!userData) {
      argument.reply({
        embeds: [
          JSON.parse(
            JSON.stringify(embeds.Error).replace(
              "%errorMessage%",
              "You/or user you mention need to be registered in system!"
            )
          ),
        ],
      });
      return;
    }

    argument.reply({
      embeds: [
        JSON.parse(
          JSON.stringify(embeds.UserProfile)
            .replace("%user%", user.username.replace(/"/g, "'"))
            .replace("%uuid%", userData.uuid)
            .replace("%uid%", userData.uid)
            .replace("%balance%", `${userData.wallet.balance} $`)
            .replace("%userAvatar%", user.displayAvatarURL())
        ),
      ],
    });
  }
}
