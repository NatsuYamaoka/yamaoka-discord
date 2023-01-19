import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { BaseCommand } from "../../core/abstracts/command/command.abstract";
import { CommandType } from "../../core/abstracts/command/types/command.types";
import { Quiz, QuizQuestion, QuizQuestionAnswer, User } from "../../entities";

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
      .addNumberOption((option) =>
        option
          .setName("quiz-reward")
          .setDescription("Specify quiz reward")
          .setMinValue(10)
          .setMaxValue(100)
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
    const quizReward = argument.options.getNumber("quiz-reward", true);
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
      const errorMsg = `Hm.. Seems like I can't find any data for you..`;

      return argument.reply({ content: errorMsg, ephemeral: true });
    }

    const messageCollector = argument.channel?.createMessageCollector({
      time: 60 * 1000 * 10, // 10 minutes
      filter: (message) => message.author.id === argument.user.id,
    });

    if (!messageCollector) {
      const errorMsg =
        "Sorry! Cannot create message collector for this channel.";

      return argument.reply({ content: errorMsg, ephemeral: true });
    }

    const questions: { question: string; answers: string[] }[] = [];

    const infoEmbed = new EmbedBuilder()
      .setTitle("Overall info")
      .setDescription(
        "Yo! To create your quiz, follow instructions below:\n\n" +
          "To add questions with answers to your quiz you need to follow simple construction rule\n" +
          "`question;answer` or `question;answer:answer2:answer3`\n" +
          "First example if you want to create a question with a single answer," +
          "and second example is question with multiple answers\n\n" +
          "⚠️ *you need to provide only one question per message*"
      )
      .setFooter({
        text: 'To save quiz just type "save", to cancle quiz creation type "cancel"',
      });

    await argument.reply({ embeds: [infoEmbed] });

    messageCollector
      .on("collect", (message) => {
        message.delete().catch();

        if (["cancel", "save"].includes(message.content.toLowerCase())) {
          messageCollector.stop(message.content.toLowerCase());

          return;
        }

        // TODO: Create more complex regexp to check if question was builded correctly
        if (!message.content.match(";")?.length) {
          argument.followUp({
            content: "Please, provide correct quiz question.",
            ephemeral: true,
          });

          return;
        }

        const content = message.content.split(";");
        const question = content[0];
        const answers = content[1].split(":").map((answer) => answer.trim());

        questions.push({ answers, question });

        const questionsAndAnswers =
          "Questions:\n" +
          questions
            .map(
              ({ question, answers }) => `${question}: ${answers.join(", ")}`
            )
            .join("\n\n");

        argument.editReply({ content: questionsAndAnswers }).catch((err) => {});
      })

      .on("end", async (collected, reason) => {
        switch (reason) {
          case "time":
            argument
              .editReply({
                content:
                  "Seems like we need to stop... Thanks for using create-quiz command!",
                embeds: [],
              })
              .catch((err) => {});

            break;
          case "cancel":
            argument
              .editReply({
                content: "create-quiz command was canceled by you!",
                embeds: [],
              })
              .catch((err) => {});

            break;
          case "save":
            if (!questions.length) {
              argument
                .editReply({
                  content:
                    "Not enough questions was provided to save this quiz",
                  embeds: [],
                })
                .catch((err) => {});

              return;
            }

            const formatedQuestions = questions.map(({ question, answers }) => {
              const mappedAnswers = answers.map((answer) =>
                QuizQuestionAnswer.create({
                  content: answer,
                })
              );

              return QuizQuestion.create({ answers: mappedAnswers, question });
            });

            const savedQuiz = await Quiz.create({
              author: userData,
              name: quizName,
              reward: quizReward,
              questions: formatedQuestions,
              completePercentage: quizPercentage,
            }).save();

            const description =
              `Quiz successfuly saved in database!\n` +
              `Quiz id: ${savedQuiz.id}`;

            argument.followUp({ content: description });
            break;
        }
      });
  }
}
