import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { SlashCommand } from "@decorators/commands.decorator";
import { UserEntity } from "@entities/index";
import { gatherProfileTokens } from "@utils/gather-tokens.util";
import { EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";

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

    const { tokens } = gatherProfileTokens(
      userData,
      interaction.user,
      (interaction.member as GuildMember) || undefined
    );

    const embed =
      userData.selected_preset?.[0]?.json || JSON.stringify(defaultTemplate);

    const editedEmbed = embed.replace(/{{.*?}}/g, (mtch) => {
      return `${tokens[mtch.replace(/\{\{|\}\}/g, "")]}`;
    });

    const buildedEmbed = new EmbedBuilder(JSON.parse(editedEmbed));
    interaction.editReply({ embeds: [buildedEmbed] }).catch((err) => {
      // I will be not surprised if users will find a way to make this error, so it's better to handle it
      this.sendError(err.message, interaction, false);
    });
  }
}

// TODO: Rework this
const defaultTemplate = {
  author: {
    name: "{{user.name}}",
  },
  description:
    "**Messages**: {{user.messages}}\n**Messages Exp**: {{user.message_exp}}\n\n**Voice Time**: {{user.voice_time}}\n**Voice Exp**: {{user.voice_exp}}",
  fields: [
    {
      name: "📦",
      value: "{{user.inventory_items}}",
      inline: true,
    },
    {
      name: "📃",
      value: "{{user.profile_presets}}",
      inline: true,
    },
    {
      name: "💸",
      value: "{{user.balance}} | {{user.voice_balance}}",
      inline: true,
    },
  ],
  thumbnail: {
    url: "{{user.avatar}}",
  },
  color: 45300,
};
