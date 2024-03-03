import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { SlashCommand } from "@decorators/commands.decorator";
import { UserEntity } from "@entities/index";
import { gatherProfileTokens } from "@utils/gather-tokens.util";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

// ? Re-do template, beacuse it's fucking awful. Also here is bug when some value are undefined, need to debug it but i'm lazy :(
const defaultTemplate = {
  author: {
    name: "{{user.name}}",
  },
  description:
    "**Messages**: {{user.messages}}\n**Messages Exp**: {{user.messages_exp}}\n\n**Voice Time**: {{user.voice_time}}\n**Voice Exp**: {{user.voice_exp}}",
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
  color: "#2f3136",
};

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

    let userData = await UserEntity.findOne({
      where: {
        uid: userOption.id,
      },
      relations: {
        inventory: true,
        wallet: true,
        profile_presets: true,
        selected_preset: true,
      },
    });

    if (!userData) {
      // ! We need to create user like this so other relations will create too.
      // ! Also we need to find other places where user can possible be not created and create entities for them.
      // ? Maybe create some sort of a function "createUser()" that will do the same as below?
      userData = await UserEntity.save({
        uid: userOption.id,
        inventory: {},
        wallet: {},
      });
    }

    const { tokens } = gatherProfileTokens(userData!, interaction.user);

    let embed: string;

    if (!userData.selected_preset || !userData.selected_preset[0]) {
      embed = JSON.stringify(defaultTemplate);
    } else {
      // ? We don't need to stringify JSON here because it's already strigified in db.
      embed = userData.selected_preset[0].json;
    }

    embed = embed.replace(/{{.*?}}/g, (mtch) => {
      // ? We can remove this useless slice with more efficient regexp but again i'm fucking lazy to write it down.
      const correctedMatch = mtch.slice(2, -2);
      const value = `${tokens[correctedMatch]}`;

      return value;
    });

    const buildedEmbed = new EmbedBuilder(JSON.parse(embed));

    // ? Changing color as always...
    if (buildedEmbed.data.color) {
      buildedEmbed.setColor(buildedEmbed.data.color);
    }

    interaction.editReply({ embeds: [buildedEmbed] });
  }
}
