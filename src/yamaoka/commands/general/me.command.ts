import {
  ChatInputCommandInteraction,
  codeBlock,
  SlashCommandBuilder,
} from "discord.js";
import { BaseCommand } from "../../core/base/base.command";
import { User } from "../../entities";
import { CommandType } from "../../typings/base-command.types";

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
        content: "You/or user you mention need to be registered in system!",
      });

      return;
    }

    argument.reply({
      content: codeBlock("json", JSON.stringify(userData, null, 2)),
    });
  }
}
