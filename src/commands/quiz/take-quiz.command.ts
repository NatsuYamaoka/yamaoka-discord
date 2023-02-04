import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  userMention,
} from "discord.js";
import { ErrorMessages } from "../../common/enums/error-messages.enum";
import { getQuizStats } from "../../common/helpers/get-quiz-stats.helper";
import { sleep } from "../../common/utils/utils";
import { BaseCommand } from "../../core/abstracts/command/command.abstract";
import { CommandType } from "../../core/abstracts/command/command.types";
import { CompletedQuiz, Quiz, QuizQuestion, User } from "../../entities";

export default class TakeQuiz extends BaseCommand<CommandType.SLASH_COMMAND> {
  public options = {
    name: "take-quiz",
    data: new SlashCommandBuilder()
      .setName("take-quiz")
      .setDescription("Take quiz to try pass it")
      .addStringOption((option) =>
        option
          .setName("quiz-name")
          .setDescription("Type in quiz name")
          .setRequired(true)
      )
      .toJSON(),
  };

  public async execute(argument: ChatInputCommandInteraction<CacheType>) {
    const quizName = argument.options.getString("quiz-name", true);

    const quiz = await Quiz.findOne({
      where: {
        name: quizName,
      },
      relations: {
        author: true,
        questions: true,
        completedQuizes: {
          user: true,
        },
      },
      select: {
        completedQuizes: true,
        questions: true,
        author: {
          uid: true,
        },
      },
    });

    const userData = await User.findOne({
      where: {
        uid: argument.user.id,
      },
    });

    if (!quiz) {
      const errorMsg = `Seems like quiz **${quizName}** is not a thing there`;

      return argument.reply({ content: errorMsg, ephemeral: true });
    }

    if (!userData) {
      return argument.reply({
        content: ErrorMessages.USER_NOT_FOUND,
        ephemeral: true,
      });
    }

    const {
      totalAttempts,
      totalFailedAttempts,
      totalSuccessfulAttempts,
      userWithMostAttempts,
      userWithMostFailedAttempts,
      userWithMostSuccessfulAttempts,
    } = getQuizStats(quiz);

    const response = await this.customClient.rawApiManager.getRawUser(
      quiz.author.uid
    );

    const userOne = userWithMostAttempts
      ? `User who take this quiz the most: ${userMention(
          userWithMostAttempts.uid
        )}`
      : "";
    const userTwo = userWithMostSuccessfulAttempts
      ? `User who has the most successful attempts: ${userMention(
          userWithMostSuccessfulAttempts.uid
        )}`
      : "";
    const userThird = userWithMostFailedAttempts
      ? `User who has the most failed attempts: ${userMention(
          userWithMostFailedAttempts.uid
        )}`
      : "";

    const infoEmbed = new EmbedBuilder({
      title: `Quiz ${quiz.name} by ${response.data.username}`,
      description:
        `Total questions: ${quiz.questions.length}\n\n` +
        `Attempts stats:\n` +
        `Total: **${totalAttempts}**, successful: **${totalSuccessfulAttempts}**, failed: **${totalFailedAttempts}**\n\n` +
        `Attempts stats with users:\n` +
        `${userOne}\n` +
        `${userTwo}\n` +
        `${userThird}`,
    });

    await argument.reply({
      content: `Some info about this quiz!`,
      embeds: [infoEmbed],
      ephemeral: true,
    });

    argument.followUp({
      content: `Starting in 3 seconds!`,
      ephemeral: true,
    });

    for (let i = 0; i < 3; i++) {
      await sleep(1000);
    }

    const completedQuestions: ICompletedQuestions[] = [];

    for (const questionInstance of quiz.questions) {
      const { question, answers } = questionInstance;

      await argument.followUp({
        content: `Question: ${question}`,
        ephemeral: true,
      });

      const messages = await argument.channel?.awaitMessages({
        time: 60 * 1000,
        filter: (message) => message.author.id === argument.user.id,
        max: 1,
      });
      const message = messages?.first();

      if (!message) {
        argument.followUp({
          content: "Seems like you drop the quiz... Better luck next time!",
          ephemeral: true,
        });

        break;
      }

      await message.delete().catch();

      let isFailed = false;

      const findOpt = { id: questionInstance.id };

      completedQuestions.push({
        uuid: questionInstance.id,
        isFailed,
      });

      await sleep(100);
    }

    const completedQuestionsAmount = completedQuestions.filter(
      (q) => !q.isFailed
    ).length;
    const completePercentage = Number(
      ((completedQuestionsAmount / completedQuestions.length) * 100).toFixed(0)
    );

    const isUserFailed =
      completePercentage < quiz.completePercentage ? true : false;

    argument.followUp({
      content: `${
        isUserFailed ? "Better luck next time, " : "Good job, "
      } you finished the quiz!`,
      ephemeral: true,
    });
  }
}

interface ICompletedQuestions {
  uuid: string;
  isFailed: boolean;
}
