import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { userService } from "@app/services/user.service";
import { walletService } from "@app/services/wallet.service";
import { SlashCommand } from "@decorators/commands.decorator";
import { WalletEntity } from "@entities/index";
import { GetDuration } from "@utils/get-duration.util";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

@SlashCommand({
  name: "leaderboard",
  description: "Посмотреть таблицу по различным категориям",
  data: new SlashCommandBuilder().addStringOption((opt) =>
    opt
      .setName("category")
      .setDescription("Выберите категорию для просмотра")
      .setRequired(true)
      .addChoices(
        {
          name: "Опыт в войсе 🎙️",
          value: "voice_exp",
        },
        {
          name: "Опыт от сообщений 📝",
          value: "message_exp",
        },
        {
          name: "Количество сообщений 📝",
          value: "messages_sent",
        },
        {
          name: "Время в войсах 🎙️",
          value: "voice_time",
        },
        {
          name: "Баланс 💸",
          value: "balance",
        },
        {
          name: "Войс баланс 🎙️🪙",
          value: "voice_balance",
        }
      )
  ),
})
export class LeaderboardCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  topLists = {
    voice_exp: {
      title: "опыту в войсе 🎙️",
      data: async () => await userService.usersWithHighest("voice_exp", 5),
    },
    message_exp: {
      title: "опыту от сообщений 📝",
      data: async () => await userService.usersWithHighest("message_exp", 5),
    },
    messages_sent: {
      title: "количеству сообщений 📝",
      data: async () => await userService.usersWithHighest("messages_sent", 5),
    },
    voice_time: {
      title: "времени в войсе 🎙️",
      data: async () => await userService.usersWithHighest("voice_time", 5),
    },
    balance: {
      title: "балансу 💸",
      data: async () =>
        await walletService.walletWithHighest("balance", 5, {
          user: true,
        }),
    },
    voice_balance: {
      title: "войс балансу 🎙️🪙",
      data: async () =>
        await walletService.walletWithHighest("voice_balance", 5, {
          user: true,
        }),
    },
  };

  async execute(interaction: CmdArg<CmdType.SLASH_COMMAND>) {
    await interaction.deferReply();
    const category = interaction.options.getString("category", true);

    const embed = await this.createEmbedForCategory(category);
    interaction.editReply({ embeds: [embed] });
  }

  async createEmbedForCategory(category: string) {
    const emojis = ["🥇", "🥈", "🥉", "4️⃣.", "5️⃣."];
    const categoryList = this.topLists[category as keyof typeof this.topLists];
    const embed = new EmbedBuilder()
      .setTitle(`📊 Таблица по категории`)
      .setColor("Blue");

    let description = `Топ 5 по ${categoryList?.title}\n\n`;

    const categoryData = await categoryList.data()
    const categoryEntries = categoryData.entries()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    for (const [index, user] of categoryEntries) {
      const value = user[category as never] as string | number;

      const username = `<@${
        user instanceof WalletEntity ? user.user.uid : user.uid
      }>`;

      description += `${emojis[index]}  ${username}\n - *${
        category === "voice_time"
          ? GetDuration((value as number) / 1000)
          : value
      }*\n`;
    }

    // TODO: Show user's rank in the leaderboard

    return embed.setDescription(description);
  }
}
