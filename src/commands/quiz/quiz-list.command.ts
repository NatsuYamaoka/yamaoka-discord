import {
  ActionRowBuilder,
  ButtonBuilder,
  CacheType,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
  userMention,
} from "discord.js";
import { getQuizStats } from "../../common/helpers/get-quiz-stats.helper";
import {
  getNavigationSetup,
  NavigationButtons,
} from "../../common/helpers/navigation.helper";
import PaginationHelper from "../../common/helpers/pagination.helper";
import { BaseCommand } from "../../core/abstracts/command/command.abstract";
import { CommandType } from "../../core/abstracts/command/types/command.types";
import { Quiz } from "../../entities";

export default class QuizList extends BaseCommand<CommandType.SLASH_COMMAND> {
  public options = {
    name: "quiz-list",
    data: new SlashCommandBuilder()
      .setName("quiz-list")
      .setDescription("List all quizes!")
      .addUserOption((option) =>
        option
          .setName("quiz-author")
          .setDescription("You can select user to get quizes created by him")
      )
      .toJSON(),
  };

  public async execute(
    argument: ChatInputCommandInteraction<CacheType>
  ): Promise<void> {
    const user = argument.options.getUser("quiz-author");

    let quizes: Quiz[] = [];

    if (user) {
      quizes = await Quiz.find({
        where: { author: { uid: user.id } },
        relations: {
          author: true,
          completedQuizes: true,
          questions: true,
        },
        select: {
          author: { uid: true },
          completedQuizes: true,
          questions: true,
        },
      });
    } else {
      quizes = await Quiz.find({
        relations: {
          author: true,
          completedQuizes: { user: true },
          questions: true,
        },
        select: {
          author: { uid: true },
          completedQuizes: { isFailed: true, user: { uid: true } },
          questions: true,
        },
      });
    }

    if (!quizes.length) {
      argument.reply({
        content: "Sorry, I can't find quizes!",
        ephemeral: true,
      });

      return;
    }

    const { toLeftButton, toStopButton, toRightButton } = getNavigationSetup();

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
      toLeftButton,
      toStopButton,
      toRightButton,
    ]);

    const paginationHelper = new PaginationHelper(quizes, {
      elementsOnPage: 9,
    });

    const mapFunc = (quiz: Quiz) => {
      const { totalAttempts, totalSuccessfulAttempts, totalFailedAttempts } =
        getQuizStats(quiz);

      const description =
        `Author: ${userMention(quiz.author.uid)}\n` +
        `Total questions: **${quiz.questions.length}**\n` +
        `Attempts stats:\n` +
        `Total: **${totalAttempts}**, successful: **${totalSuccessfulAttempts}**, failed: **${totalFailedAttempts}**`;

      return {
        name: quiz.name,
        value: description,
        inline: true,
      };
    };

    const initialPage = paginationHelper.createPage();
    const initialEmbed = new EmbedBuilder({
      title: "Quiz List",
      fields: initialPage.map(mapFunc),
      footer: {
        text: `Total quizes: ${quizes.length} | Page: ${paginationHelper.page}/${paginationHelper.totalPages}`,
      },
    });

    const response = await argument.reply({
      embeds: [initialEmbed],
      components: [actionRow],
      ephemeral: true,
    });

    const collector = argument.channel?.createMessageComponentCollector({
      interactionResponse: response,
      time: 1000 * 60 * 10, // 10 minutes
      filter: (interaction) => interaction.user.id === argument.user.id,
      componentType: ComponentType.Button,
    });

    if (!collector) {
      argument.reply({
        content: "I cannot create component collector, try again later!",
        ephemeral: true,
      });

      return;
    }

    collector.on("collect", (interaction) => {
      switch (interaction.customId) {
        case NavigationButtons.TO_LEFT:
          interaction.update({
            embeds: [
              initialEmbed
                .setFields(
                  paginationHelper.prevPage().createPage().map(mapFunc)
                )
                .setFooter({
                  text: `Total quizes: ${quizes.length} | Page: ${paginationHelper.page}/${paginationHelper.totalPages}`,
                }),
            ],
          });
          break;
        case NavigationButtons.TO_STOP:
          interaction.update({ components: [] });

          collector.stop();
          break;
        case NavigationButtons.TO_RIGHT:
          interaction.update({
            embeds: [
              initialEmbed
                .setFields(
                  paginationHelper.nextPage().createPage().map(mapFunc)
                )
                .setFooter({
                  text: `Total quizes: ${quizes.length} | Page: ${paginationHelper.page}/${paginationHelper.totalPages}`,
                }),
            ],
          });
          break;
      }
    });
  }
}
