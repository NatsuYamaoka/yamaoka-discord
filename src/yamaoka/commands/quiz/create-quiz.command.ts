import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { sleep } from "../../../helpers/utils";
import { BaseCommand } from "../../core/base/base.command";
import { Quiz, QuizQuestion, User } from "../../entities";
import { CommandType } from "../../typings/base-command.types";
import { embeds } from "../../../configs/yamaoka/config.json";
import { userInfo } from "os";
import { string } from "joi";
export default class CreateQuiz extends BaseCommand<CommandType.SLASH_COMMAND> {
  public options = {
    name: "create-quiz",
    data: new SlashCommandBuilder()
      .setName("create-quiz")
      .setDescription("Create new quiz")
      .addStringOption((option) =>
        option
          .setName("quiz-name")
          .setDescription("Specify quiz name")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("quiz-reward")
          .setDescription("Specify quiz reward (amount of money)")
          .setRequired(true)
      )
      .addNumberOption((option) =>
        option
          .setName("complete-percentage")
          .setDescription(
            'Provide percantage that user must score to "complete" this quiz'
          )
          .setMinValue(1)
          .setMaxValue(100)
          .setRequired(true)
      )
      .toJSON(),
  };

  public async execute(
    argument: ChatInputCommandInteraction<CacheType>
  ): Promise<void> {
    const quizName = argument.options.getString("quiz-name", true);
    const quizReward = argument.options.getString("quiz-reward", true);
    const quizPercentage = argument.options.getNumber(
      "complete-percentage",
      true
    );
    const userData = await User.findOne({
      where: {
        uid: argument.user.id,
      },
    });

    if (!userData) {
      const errorMessage = { ...embeds.Error };
      errorMessage.description = errorMessage.description.replace(
        "%errorMessage%",
        "You need to be registered in our system!"
      );
      argument.reply({
        embeds: [errorMessage],
        ephemeral: true,
      });
      return;
    }

    const messageCollector = argument.channel?.createMessageCollector({
      time: 60 * 1000 * 10, // 10 minutes
      filter: (message) => message.author.id === argument.user.id,
    });

    if (!messageCollector) {
      const errorMessage = { ...embeds.Error };
      errorMessage.description = errorMessage.description.replace(
        "%errorMessage%",
        "Sorry! Cannot create message collector on this channel."
      );
      argument.reply({
        embeds: [errorMessage],
        ephemeral: true,
      });
      return;
    }

    const questions: IQuizQuestion[] = [];
    const embed = new EmbedBuilder({
      title: "Overall info",
      description:
        `⚠️ Right now you will be asked to provide questions for your quiz\n\n` +
        `You must type one question per message.\n` +
        `To construct your question, follow example below:\n` +
        `\`<How many many there?>;[5:10:15]\`\n\n` +
        `Text in \`<>\` is your question. Answers placed in \`[]\`\n` +
        `You can provide several answers. To do so you must split them using \`:\` symbol.\n\n` +
        `*Do not include \`<>\` and \`[]\` when you create your questions it's just here for example!*`,
    });

    await argument.reply({
      ephemeral: true,
      embeds: [embed],
    });

    await sleep(2000);
    const canStartTyping = new EmbedBuilder({
      title: `You can start writing down your first question! 👀`,
      color: 4631546,
    });
    argument.followUp({ embeds: [canStartTyping], ephemeral: true });

    messageCollector
      .on("collect", (message) => {
        message.delete().catch();

        if (["cancel", "save"].includes(message.content.toLowerCase())) {
          messageCollector.stop();

          return;
        }

        if (!message.content.match(";")?.length) {
          const errorMessage = { ...embeds.Error };
          errorMessage.description = errorMessage.description.replace(
            "%errorMessage%",
            "Please, provide correct quiz question."
          );
          argument.followUp({
            embeds: [errorMessage],
            ephemeral: true,
          });
          return;
        }

        const content = message.content.split(";");
        const question = content[0];
        const answers = content[1].split(":").map((answer) => answer.trim());
        questions.push({
          answers,
          question,
        });

        const quizQuestions = { ...embeds.QuizMakingQuestions };
        const questionsAndAnswers = questions
          .map(
            (element, index) =>
              `**Question no.${index + 1}**\nQuestion: ${
                element.question
              }.\nAnswers: ${element.answers.join(", ")}\n`
          )
          .join(" ");
        quizQuestions.description = quizQuestions.description.replace(
          "%questions%",
          questionsAndAnswers as any
        );

        argument.editReply({
          embeds: [quizQuestions],
        });

        const SuccessEmbed = new EmbedBuilder({
          title: `Question "${question}" was successfully added!`,
          color: 5025616,
        });
        argument.followUp({ embeds: [SuccessEmbed], ephemeral: true });
      })

      .on("end", async () => {
        if (!questions.length) return;

        const formatedQuestions = questions.reduce<QuizQuestion[]>(
          (prev, curr) => {
            const questionEntity = QuizQuestion.create({
              question: curr.question,
              answers: curr.answers,
            });

            prev.push(questionEntity);

            return prev;
          },
          []
        );

        const savedQuiz = await Quiz.create({
          author: userData,
          name: quizName,
          reward: quizReward,
          questions: formatedQuestions,
          completePercentage: quizPercentage,
        }).save();

        const successEmbed = { ...embeds.Success };
        successEmbed.title = successEmbed.title.replace(
          "%proccess%",
          "Creating of quiz"
        );
        successEmbed.description = successEmbed.description.replace(
          "%description%",
          `Quiz successfuly saved in database!\nQuiz id: ${savedQuiz.uuid}`
        );
        argument.followUp({
          embeds: [successEmbed],
          ephemeral: true,
        });
      });
  }
}

interface IQuizQuestion {
  question: string;
  answers: string[];
}
