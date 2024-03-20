import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { userService } from "@app/services/user.service";
import { walletService } from "@app/services/wallet.service";
import { SlashCommand } from "@decorators/commands.decorator";
import { UserEntity, WalletEntity } from "@entities/index";
import { GetDuration } from "@utils/get-duration.util";
import { EmbedBuilder } from "discord.js";

@SlashCommand({
  name: "leaderboard",
  description: "Посмотреть текущую статистику пользователей",
})
export class LeaderboardCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  async execute(interaction: CmdArg<CmdType.SLASH_COMMAND>) {
    await interaction.deferReply();

    const topLists = [
      {
        name: "voice_time" as keyof UserEntity,
        title: "Время в войсах 🎙️",
        data: await userService.usersWithHighest("voice_time", 5),
      },
      {
        name: "balance" as keyof WalletEntity,
        title: "Балансу 💸",
        data: await walletService.walletWithHighest("balance", 5),
      },
      {
        name: "voice_balance" as keyof WalletEntity,
        title: "Войс баланс 🎙️🪙",
        data: await walletService.walletWithHighest("voice_balance", 5),
      },
    ];

    const leaderboardEmbed = new EmbedBuilder()
      .setTitle("Топ 3 по различным категориям 🏆")
      .setDescription(
        "Ниже приведены самые активные пользователи сервера и не только! 🚀"
      )
      .setColor("Yellow")
      .setImage("https://i.imgur.com/t9BQoBE.png");

    for (const list of topLists) {
      let users = "";

      for (const [index, user] of list.data.entries()) {
        let username = "Неизвестно";
        let value = user[list.name as never] as string | number;

        if (user instanceof WalletEntity) {
          username = await this.getUsernameFromId(user.userUid);
        } else {
          username = await this.getUsernameFromId(user.uid);
        }

        if (typeof value === "number" && list.name === "voice_time") {
          value = GetDuration(value);
        }

        const emojis = ["🥇", "🥈", "🥉", "4.", "5."];

        users += `${emojis[index]} ${username}\n - *${value}*\n`;
      }

      leaderboardEmbed.addFields({
        name: list.title,
        value: users,
        inline: true,
      });
    }

    interaction.editReply({ embeds: [leaderboardEmbed] });
  }

  async getUsernameFromId(id: string) {
    return (await this.client.users.fetch(id))?.username || "Неизвестно";
  }
}
