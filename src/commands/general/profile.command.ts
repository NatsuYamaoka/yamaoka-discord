import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getQuizStats } from "../../common/helpers/get-quiz-stats.helper";
import { BaseCommand } from "../../core/abstracts/command/command.abstract";
import { CommandType } from "../../core/abstracts/command/types/command.types";
import { User } from "../../entities";

export default class ProfileCommand extends BaseCommand<CommandType.SLASH_COMMAND> {
  public options = {
    name: "profile",
    requiredRegistration: true,
    data: new SlashCommandBuilder()
      .setName("profile")
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
        completedQuizes: true,
        quizes: true,
      },
    });

    if (!userData) {
      const description =
        "You/or user you mention need to be registered in system!";

      return argument.reply({ content: description });
    }

    const { totalFailedAttempts, totalSuccessfulAttempts } = getQuizStats({
      completedQuizes: userData.completedQuizes,
    });

    const createdQuizes = userData.quizes.length;

    argument.reply({
      content: "Etto.. Embed for profile command is not done yet....",
    });
  }
}
