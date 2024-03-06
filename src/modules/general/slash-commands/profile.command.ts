import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { SlashCommand } from "@decorators/commands.decorator";
import { ProfilePresetEntity, UserEntity } from "@entities/index";
import { parsePresetTokens } from "@utils/embed-parser.util";
import { gatherProfileTokens } from "@utils/gather-tokens.util";
import { SlashCommandBuilder } from "discord.js";

@SlashCommand({
  name: "profile",
  description: "shows your profile",
  data: new SlashCommandBuilder().addUserOption((opt) =>
    opt
      .setName("user")
      .setDescription("select user to check his profile")
      .setRequired(false)
  ),
})
export class ProfileCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  async execute(interaction: CmdArg<CmdType.SLASH_COMMAND>) {
    await interaction.deferReply();

    const userOption = interaction.options.getUser("user") || interaction.user;
    const userData = await UserEntity.findOne({
      where: {
        uid: userOption.id,
      },
      relations: {
        inventory: true,
        wallet: true,
        profile_presets: true,
        selected_preset: true,
      },
    }).then((user) => {
      if (!user) {
        return UserEntity.save({
          uid: userOption.id,
          inventory: {},
          wallet: {},
        });
      } else {
        return user;
      }
    });

    const member = interaction.guild?.members.cache.get(userOption.id);
    if (!member) {
      // Since out command is guild only, we can assume that user is a member of the server
      return this.sendError("User is not a member of the server", interaction);
    }

    const { tokens } = gatherProfileTokens(
      userData,
      member,
      this.client.voiceManager
    );

    const embed = userData.selected_preset?.[0] as ProfilePresetEntity;

    interaction
      .editReply({ embeds: [parsePresetTokens(tokens, embed)] })
      .catch((err) => {
        // I will be not surprised if users will find a way to make this error, so it's better to handle it
        this.sendError(err.message, interaction, false);
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
        "Отправлено сообщений: **{{user.messages}}**\nПолучено опыта: **{{user.message_exp}}** 🧪",
      inline: true,
    },
    {
      name: "🎙️ Войс-чаты:",
      value:
        "Проведено в войс-чатах: **{{user.voice_time}}**\nПолучено опыта: **{{user.voice_exp}}** 🧪",
      inline: true,
    },
    {
      name: " ",
      value: " ",
      inline: false,
    },
    {
      name: "🖼️ Профилей: {{user.profile_presets}}",
      value: " ",
      inline: true,
    },
    {
      name: "📦 Предметов: {{user.inventory_items}}",
      value: " ",
      inline: true,
    },
    {
      name: "💸 Баланс: {{user.balance}}",
      value: " ",
      inline: true,
    },
  ],
  footer: {
    text: "💜 Любимый участник нашего сервера!",
  },
};
