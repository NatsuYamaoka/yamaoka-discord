export default {
  prefix: "$",
  embeds: {
    Success: {
      title: "%proccess% is finished!",
      color: 5025616,
      description: "📃 %description%",
    },
    Error: {
      title: "Something's wrong, I can feel it...",
      color: 16402504,
      description: "⚠️ %errorMessage%",
    },
    QuizMakingQuestions: {
      title: "Quiz questions 🌻",
      description:
        "🍃 You can continue sending new questions!\n\n%questions%\n*If you want to completly stop, type in: **cancel**\nTo finish and save your quiz, type in: **save** *",
    },
    UserProfile: {
      title: "Welcome, %user%",
      color: 4631546,
      description: "Here is all information about you:",
      thumbnail: {
        url: "%userAvatar%",
      },
      fields: [
        {
          name: "Your's uuid",
          value: "📃 %uuid%",
          inline: false,
        },
        {
          name: "Your's uid",
          value: "📝 %uid%",
          inline: true,
        },
        {
          name: "Your's wallet balance",
          value: "💰 %balance%",
          inline: true,
        },
        {
          name: "⠀",
          value: "⠀",
          inline: true,
        },
        {
          name: "Created quizes",
          value: "👀 %createdQuizes%",
          inline: true,
        },
        {
          name: "Completed quizes",
          value: "👀 %completedQuizes%",
          inline: true,
        },
        {
          name: "Failed quizes",
          value: "👀 %failedQuizes%",
          inline: true,
        },
      ],
    },
  },
};
