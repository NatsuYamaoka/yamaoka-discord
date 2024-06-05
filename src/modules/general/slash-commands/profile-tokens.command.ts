import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { logger } from "@app/core/logger/logger-client";
import { userService } from "@app/services/user.service";
import { SlashCommand } from "@decorators/commands.decorator";
import { ParsePresetTokens } from "@utils/embed-parser.util";
import { GatherProfileTokens } from "@utils/gather-tokens.util";
import { Embed, EmbedBuilder, SlashCommandBuilder } from "discord.js";

@SlashCommand({
  name: "profile-tokens",
  description: "Доступные токены для профиля",
  data: new SlashCommandBuilder(),
})
export class ProfileTokens extends BaseCommand<CmdType.SLASH_COMMAND> {
  async execute(interaction: CmdArg<CmdType.SLASH_COMMAND>) {
    // TODO: Refactor to list with pagination
    const embed = new EmbedBuilder()
      .setTitle("Доступные токены для профиля")
      .setDescription(
        "Список доступных токенов для профиля пользователя:\n" +
          "1. `{{user.avatar}}` - Аватар пользователя\n" +
          "2. `{{user.name}}` - Имя пользователя\n" +
          "3. `{{user.display_name}}` - Отображаемое имя пользователя\n" +
          "4. `{{user.id}}` - ID пользователя\n" +
          "5. `{{user.joined_discord}}` - Дата присоединения к Discord\n" +
          "6. `{{user.joined_server}}` - Дата присоединения к серверу\n" +
          "7. `{{user.roles}}` - Роли пользователя\n" +
          "8. `{{user.messages}}` - Количество сообщений\n" +
          "9. `{{user.voice_time}}` - Время в голосовых каналах\n" +
          "10. `{{user.voice_balance}}` - Баланс голосовых каналов\n" +
          "11. `{{user.balance}}` - Баланс\n" +
          "12. `{{user.inventory_items}}` - Количество предметов в инвентаре\n" +
          "13. `{{user.profile_presets}}` - Количество пресетов профиля\n" +
          "14. `{{user.voice_exp}}` - Опыт в голосовых каналах\n" +
          "15. `{{user.message_exp}}` - Опыт от сообщений"
      );

    interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
