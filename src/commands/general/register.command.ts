import {
  ChatInputCommandInteraction,
  CacheType,
  SlashCommandBuilder,
} from "discord.js";
import appConfig from "../../app.config";
import { BaseCommand } from "../../core";
import { User } from "../../entities";
import { CommandType } from "../../typings/enums";

export default class RegisterCommand extends BaseCommand<CommandType.SLASH_COMMAND> {
  public options = {
    name: "register",
    data: new SlashCommandBuilder()
      .setName("register")
      .setDescription("Register in bot's system")
      .toJSON(),
  };

  public async execute(argument: ChatInputCommandInteraction<CacheType>) {
    const userData = await User.findOneBy({
      uid: argument.user.id,
    });

    if (userData) {
      const errorEmbed = {
        ...appConfig.embeds.Error,
      };

      errorEmbed.description = errorEmbed.description.replace(
        "%errorMessage%",
        "You are already registered in system!"
      );

      return argument.reply({ embeds: [errorEmbed] });
    }

    const registeredUser = await User.create({
      uid: argument.user.id,
      wallet: {},
    }).save();

    const profileEmbed = {
      ...appConfig.embeds.Success,
    };

    const description =
      `Thanks for registering!\n` + `Your's uuid: \`${registeredUser.uuid}\``;

    profileEmbed.title = profileEmbed.title.replace(
      "%proccess%",
      "Registration"
    );
    profileEmbed.description = profileEmbed.description.replace(
      "%description%",
      description
    );

    argument.reply({ embeds: [profileEmbed] });
  }
}
