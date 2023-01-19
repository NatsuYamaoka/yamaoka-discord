import {
  ChatInputCommandInteraction,
  CacheType,
  SlashCommandBuilder,
} from "discord.js";
import { BaseCommand } from "../../core/abstracts/command/command.abstract";
import { CommandType } from "../../core/abstracts/command/types/command.types";
import { User } from "../../entities";

export default class RegisterCommand extends BaseCommand<CommandType.SLASH_COMMAND> {
  public options = {
    name: "register",
    data: new SlashCommandBuilder()
      .setName("register")
      .setDescription("Register in bot's system")
      .toJSON(),
  };

  public async execute(argument: ChatInputCommandInteraction<CacheType>) {
    const userData = await User.findOne({
      where: {
        uid: argument.user.id,
      },
    });

    if (userData) {
      const description = "Etto.. You're already registreted..";

      return argument.reply({ content: description });
    }

    const user = await User.create({
      uid: argument.user.id,
      wallet: {},
    }).save();

    const description =
      "Thanks for registering!\n" + `Your's uuid: \`${user.id}\``;

    argument.reply({ content: description });
  }
}
