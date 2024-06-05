import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { logger } from "@app/core/logger/logger-client";
import { userService } from "@app/services/user.service";
import { SlashCommand } from "@decorators/commands.decorator";
import { ParsePresetTokens } from "@utils/embed-parser.util";
import { GatherProfileTokens } from "@utils/gather-tokens.util";
import { SlashCommandBuilder } from "discord.js";

@SlashCommand({
  name: "profile",
  description: "Показать профиль пользователя",
  data: new SlashCommandBuilder().addUserOption((opt) =>
    opt
      .setName("user")
      .setDescription("Выберите пользователя для просмотра профиля")
      .setRequired(false)
  ),
})
export class ProfileCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  async execute(interaction: CmdArg<CmdType.SLASH_COMMAND>) {
    const { sendError } = this.getMethods(interaction);
    await interaction.deferReply();

    const userOption = interaction.options.getUser("user") || interaction.user;

    const userData = await userService.findOneByIdOrCreate(userOption.id, {
      inventory: true,
      wallet: true,
      profile_presets: true,
      selected_preset: true,
    });

    const member = interaction.guild?.members.cache.get(userOption.id);
    if (!member) {
      // Since out command is guild only, we can assume that user is a member of the server
      return sendError("Пользователь не участник сервера");
    }

    const { tokens } = GatherProfileTokens(
      userData,
      member,
      this.client.voiceManager
    );

    const embed = userData.selected_preset?.[0];

    interaction
      .editReply({ embeds: [ParsePresetTokens(tokens, embed)] })
      .catch((err) => {
        sendError(err.message); // I will be not surprised if users will find a way to make this error, so it's better to handle it
        logger.error(err); // For future investigation
      });
  }
}

export const defaultTemplate = {
  color: 9266629,
  author: {
    name: "Профиль пользователя",
  },
  title: "{{user.display_name}}",
  thumbnail: {
    url: "{{user.avatar}}",
  },

  fields: [
    {
      name: "🗂️ Общая информация:",
      value:
        "С нами на сервере с: <t:{{user.joined_server}}:D>\n" +
        "В дискорде с: <t:{{user.joined_discord}}:D>",
      inline: false,
    },
    {
      name: "📨 Сообщения:",
      value:
        "Отправлено: **{{user.messages}}**\nПолучено опыта:\n**{{user.message_exp}}** 🧪",
      inline: true,
    },
    {
      name: "🎙️ Войс-чаты:",
      value:
        "Проведено в войс-чатах:\n**{{user.voice_time}}**\nПолучено опыта:\n**{{user.voice_exp}}** 🧪",
      inline: true,
    },
    {
      name: " ",
      value: " ",
      inline: false,
    },
    {
      name: "🎒 Инвентарь:",
      value:
        "- Профилей: **{{user.profile_presets}}** 🖼️\n- Предметов: **{{user.inventory_items}}** 📦",
      inline: true,
    },
    {
      name: "💰 Кошелёк:",
      value:
        "- Баланс: **{{user.balance}}** 💸\n- Войс баланс: **{{user.voice_balance}}** 🎙️🪙",
      inline: true,
    },
  ],
  footer: {
    text: "💜 Любимый участник нашего сервера!",
  },
};
