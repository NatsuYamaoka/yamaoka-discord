import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { SlashCommand } from "@decorators/commands.decorator";
import { ProfilePresetEntity, UserEntity } from "@entities/index";
import {
  NavigationButtons,
  getNavigationSetup,
} from "@helpers/navigation.helper";
import PaginationHelper from "@helpers/pagination.helper";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  GuildMember,
} from "discord.js";

import { defaultTemplate } from "./profile.command";
import { gatherProfileTokens } from "@utils/gather-tokens.util";

const TO_PROCEED = "to-proceed-button";

@SlashCommand({
  name: "set-profile",
  description: "sets your profile",
})
export class SetProfileCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  async execute(interaction: CmdArg<CmdType.SLASH_COMMAND>) {
    await interaction.deferReply();

    const userData = await UserEntity.findOne({
      where: {
        uid: interaction.user.id,
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
          uid: interaction.user.id,
          inventory: {},
          wallet: {},
        });
      } else {
        return user;
      }
    });

    if (!userData.profile_presets || userData.profile_presets?.length == 0) {
      return this.sendError(
        "You don't have any profile presets, please create one",
        interaction
      );
    }

    // Creating pseudo preset list, to not mess with the original data
    const presets = [
      {
        id: "default",
        json: JSON.stringify(defaultTemplate),
      } as ProfilePresetEntity,
      ...userData.profile_presets,
    ];

    const { list } = getNavigationSetup();

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(list);
    const actionRowProceed =
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(TO_PROCEED)
          .setStyle(ButtonStyle.Success)
          .setEmoji("✅")
          .setLabel("Выбрать текущий пресет")
      );

    const paginationHelper = new PaginationHelper(presets, {
      elementsOnPage: 1,
    });

    const [firstPreset] = paginationHelper.createPage();

    const componentCollector =
      interaction.channel?.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (int) =>
          int.user.id === interaction.user.id &&
          int.message.interaction?.id === interaction.id,
        time: 5 * 1000 * 60000, // 5 minutes
      });

    if (!componentCollector) {
      return this.sendError("Can't create component collector :(", interaction);
    }

    const { tokens } = gatherProfileTokens(
      userData,
      interaction.member as GuildMember,
      this.client.voiceManager
    );

    await interaction.editReply({
      content: this.createContent(paginationHelper),
      embeds: [this.createEmbedFromJson(tokens, firstPreset)],
      components: [actionRow, actionRowProceed],
    });

    return componentCollector.on("collect", async (int) => {
      let preset: ProfilePresetEntity | undefined;

      switch (int.customId) {
        case NavigationButtons.TO_LEFT:
          preset = paginationHelper.prevPage().createPage()[0];
          break;
        case NavigationButtons.TO_RIGHT:
          preset = paginationHelper.nextPage().createPage()[0];
          break;
        case NavigationButtons.TO_STOP:
          componentCollector.stop();
          interaction.deleteReply();
          return;
        case TO_PROCEED:
          preset = paginationHelper.currentPage;
          userData.selected_preset = preset.id !== "default" ? [preset] : []; // If default preset, then remove it

          await UserEntity.save(userData);
          this.sendSuccess("Ваш профиль успешно обновлен! 🎉", interaction);
          return;
      }

      if (!preset) {
        return;
      }

      int.update({
        content: this.createContent(paginationHelper),
        embeds: [this.createEmbedFromJson(tokens, preset)],
      });
    });
  }

  public createEmbedFromJson(
    tokens: { [k: string]: string | number },
    preset: ProfilePresetEntity
  ) {
    const embed = preset.json || JSON.stringify(defaultTemplate);
    const embedBuilder = embed.replace(/{{(.*?)}}/g, (_, mtch) => {
      return `${tokens[mtch].toString().replace(/"/g, '\\"')}`;
    });

    return new EmbedBuilder(JSON.parse(embedBuilder));
  }

  public createContent(
    paginationHelper: PaginationHelper<ProfilePresetEntity>
  ) {
    return (
      `### 📃 Текущий пресет: [${paginationHelper.page} | ${paginationHelper.totalPages}]\n` +
      `Используйте стрелки ниже чтобы выбрать подходящий пресет\n` +
      `Нажмите кнопку с ✅ чтобы выбрать текущий пресет\n` +
      `Нажмите кнопку с ❌ чтобы закрыть меню\n` +
      `### Превью пресета:`
    );
  }
}
