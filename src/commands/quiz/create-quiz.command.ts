import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import appConfig from "../../app.config";
import { BaseCommand } from "../../core";
import { Quiz, QuizQuestion, User } from "../../entities";
import { sleep } from "../../helpers/utils";
import { CommandType } from "../../typings/enums";

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

  public async execute(argument: ChatInputCommandInteraction<CacheType>) {
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

    const errorEmbed = {
      ...appConfig.embeds.Error,
    };

    if (!userData) {
      errorEmbed.description = errorEmbed.description.replace(
        "%errorMessage%",
        "You need to be registered in our system!"
      );

      return argument.reply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }

    const messageCollector = argument.channel?.createMessageCollector({
      time: 60 * 1000 * 10, // 10 minutes
      filter: (message) => message.author.id === argument.user.id,
    });

    if (!messageCollector) {
      const errorMsg =
        "Sorry! Cannot create message collector for this channel.";

      errorEmbed.description = errorEmbed.description.replace(
        "%errorMessage%",
        errorMsg
      );

      return argument.reply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }

    const questions: IQuizQuestion[] = [];

    const infoEmbed = new EmbedBuilder()
      .setTitle("Overall info")
      .setDescription(
        `⚠️ Right now you will be asked to provide questions for your quiz\n\n` +
          `You must type one question per message\n` +
          `To construct your question, follow example below:\n` +
          `\`<How many many there?>;[5:10:15]\`\n\n` +
          `Text in \`<>\` is your question. Answers placed in \`[]\`\n` +
          `You can provide several answers. To do so you must split them using \`:\` symbol.\n\n` +
          `*Do not include \`<>\` and \`[]\` when you create your questions it's just here for example!*`
      );

    await argument.reply({
      embeds: [infoEmbed],
      ephemeral: true,
    });

    await sleep(2000);

    const followUp = await argument.followUp({
      content: "You can start sending your questions!",
    });

    messageCollector
      .on("collect", (message) => {
        message.delete().catch();

        if (["cancel", "save"].includes(message.content.toLowerCase())) {
          messageCollector.stop(message.content.toLowerCase());

          return;
        }

        // TODO: Create more complex regexp to check if question was builded correctly
        if (!message.content.match(";")?.length) {
          errorEmbed.description = errorEmbed.description.replace(
            "%errorMessage%",
            "Please, provide correct quiz question."
          );

          argument.followUp({
            embeds: [errorEmbed],
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

        const quizQuestions = {
          ...appConfig.embeds.QuizMakingQuestions,
        };

        const questionsAndAnswers = questions
          .map((element, index) => {
            const quizTitle =
              `**Question no.${++index} ` + `${element.question}**\n`;

            const quizAnswers = `**Answers**: ${element.answers.join(", ")}`;

            return `${quizTitle}\n${quizAnswers}`;
          })
          .join("\n\n");

        quizQuestions.description = quizQuestions.description.replace(
          "%questions%",
          questionsAndAnswers
        );

        followUp
          .edit({ embeds: [quizQuestions] })
          .catch((err) => console.log(err.message));
      })

      .on("end", async (collected, reason) => {
        switch (reason) {
          case "time":
            argument.editReply({
              content:
                "Seems like we need to stop... Thanks for using create-quiz command!",
              embeds: [],
            });

            break;
          case "cancel":
            argument.editReply({
              content: "create-quiz command was canceled by you!",
              embeds: [],
            });

            break;
          case "save":
            if (!questions.length) {
              argument.editReply({
                content: "Not enough questions was provided to save this quiz",
                embeds: [],
              });

              return;
            }

            const formatedQuestions = questions.map(({ question, answers }) =>
              QuizQuestion.create({ answers, question })
            );

            const savedQuiz = await Quiz.create({
              author: userData,
              name: quizName,
              reward: quizReward,
              questions: formatedQuestions,
              completePercentage: quizPercentage,
            }).save();

            const successEmbed = {
              ...appConfig.embeds.Success,
            };

            const description =
              `Quiz successfuly saved in database!\n` +
              `Quiz id: ${savedQuiz.uuid}`;

            successEmbed.title = successEmbed.title.replace(
              "%proccess%",
              "Creating of quiz"
            );

            successEmbed.description = successEmbed.description.replace(
              "%description%",
              description
            );

            argument.followUp({ embeds: [successEmbed], ephemeral: true });
            break;
        }
      });
  }
}

interface IQuizQuestion {
  question: string;
  answers: string[];
}
