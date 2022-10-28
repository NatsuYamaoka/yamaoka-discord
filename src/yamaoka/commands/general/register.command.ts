import {
  ChatInputCommandInteraction,
  CacheType,
  SlashCommandBuilder,
} from "discord.js";
import { BaseCommand } from "../../core/base/base.command";
import { User } from "../../entities";
import { CommandType } from "../../typings/base-command.types";
import { embeds } from "../../../configs/yamaoka/config.json";

export default class RegisterCommand extends BaseCommand<CommandType.SLASH_COMMAND> {
  public options = {
    name: "register",
    data: new SlashCommandBuilder()
      .setName("register")
      .setDescription("Register in bot's system")
      .toJSON(),
  };

  public async execute(
    argument: ChatInputCommandInteraction<CacheType>
  ): Promise<void> {
    const userData = await User.findOneBy({
      uid: argument.user.id,
    });

    if (userData) {
      const errorMessage = { ...embeds.Error };
      errorMessage.description = errorMessage.description.replace(
        "%errorMessage%",
        "You are already registered in system!"
      );

      argument.reply({
        embeds: [errorMessage],
      });
      return;
    }

    const registeredUser = await User.create({
      uid: argument.user.id,
      wallet: {},
    }).save();

    const UserProfile = { ...embeds.UserProfile };
    UserProfile.description = UserProfile.description.replace(
      "%description%",
      `Thanks for registering!\n 👀 You'r \`uuid\` is: \`${registeredUser.uuid}\``
    );

    argument.reply({
      embeds: [UserProfile],
    });
  }
}
