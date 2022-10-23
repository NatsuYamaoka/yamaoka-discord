import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { sleep } from "../../../helpers/utils";
import { BaseCommand } from "../../core/base/base.command";
import { Quiz, QuizQuestion, User } from "../../entities";
import { CommandType } from "../../typings/base-command.types";

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
      argument.reply({
        content: "You need to be registered in our system!",
        ephemeral: true,
      });

      return;
    }

    const messageCollector = argument.channel?.createMessageCollector({
      time: 60 * 1000 * 10, // 10 minutes
      filter: (message) => message.author.id === argument.user.id,
    });

    if (!messageCollector) {
      argument.reply({
        content: "Sorry! Cannot create message collector on this channel.",
        ephemeral: true,
      });

      return;
    }

    const questions: IQuizQuestion[] = [];
    const embed = new EmbedBuilder({
      title: "Overall info 👀",
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

    argument.followUp({
      content: "👀 You can start writing down your first question!",
      ephemeral: true,
    });

    messageCollector
      .on("collect", (message) => {
        message.delete().catch();

        if (["cancel", "save"].includes(message.content.toLowerCase())) {
          messageCollector.stop();

          return;
        }

        if (!message.content.match(";")?.length) {
          message.reply("Please, provide correct quiz question.");

          return;
        }

        const content = message.content.split(";");
        const question = content[0];
        const answers = content[1].split(":").map((answer) => answer.trim());

        const questionEmbed = new EmbedBuilder({
          title: "New question",
          description:
            `🍃 You can continue sending new questions!\n\n` +
            `Question: \`${question}\`\n` +
            `Answers: \`${answers.join(", ")}\`\n\n` +
            `*If you want to completly stop, type in: \`cancel\`\n` +
            `To finish and save your quiz, type in: \`save\`*`,
        });

        argument.followUp({
          embeds: [questionEmbed],
          ephemeral: true,
        });

        questions.push({
          answers,
          question,
        });
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

        argument.followUp({
          content: `Quiz successfuly saved in database!\nQuiz id: \`${savedQuiz.uuid}\``,
          ephemeral: true,
        });
      });
  }
}

interface IQuizQuestion {
  question: string;
  answers: string[];
}
