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
      argument.reply({
        embeds: [
          JSON.parse(
            JSON.stringify(embeds.Error).replace(
              "%errorMessage%",
              "You are already registered in system!"
            )
          ),
        ],
      });

      return;
    }

    const registeredUser = await User.create({
      uid: argument.user.id,
      wallet: {},
    }).save();

    argument.reply({
      content: `Thanks for registering! 👀\nYou'r \`uuid\` is: \`${registeredUser.uuid}\``,
    });
  }
}
