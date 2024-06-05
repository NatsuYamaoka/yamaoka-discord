import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { SlashCommand } from "@decorators/commands.decorator";
import { ProfilePresetEntity, UserEntity } from "@entities/index";
import {
  NavigationButtons,
  GetNavigationSetup,
} from "@helpers/navigation.helper";
import PaginationHelper from "@helpers/pagination.helper";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  GuildMember,
} from "discord.js";

import { defaultTemplate } from "./profile.command";
import { GatherProfileTokens } from "@utils/gather-tokens.util";
import {
  CreatePreviewPresetText,
  ParsePresetTokens,
} from "@utils/embed-parser.util";
import { userService } from "@app/services/user.service";

const TO_PROCEED = "to-proceed-button";

@SlashCommand({
  name: "set-profile",
  description: "Установить пресет профиля",
})
export class SetProfileCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  async execute(interaction: CmdArg<CmdType.SLASH_COMMAND>) {
    await interaction.deferReply({ ephemeral: true });

    const userData = await userService.findOneByIdOrCreate(
      interaction.user.id,
      {
        inventory: true,
        wallet: true,
        profile_presets: true,
        selected_preset: true,
      }
    );

    if (!userData.profile_presets || userData.profile_presets?.length == 0) {
      return this.sendError(
        "У вас нет пресетов для профиля, сходите в магазин и купите их или создайте свой пресет!",
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

    const { list } = GetNavigationSetup();

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
        time: 5 * 60000, // 5 minutes
      });

    const { tokens } = GatherProfileTokens(
      userData,
      interaction.member as GuildMember,
      this.client.voiceManager
    );

    await interaction.editReply({
      content: CreatePreviewPresetText(paginationHelper),
      embeds: [ParsePresetTokens(tokens, firstPreset)],
      components: [actionRow, actionRowProceed],
    });

    return componentCollector?.on("collect", async (int) => {
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
          preset = paginationHelper.createPage()[0];
          userData.selected_preset = preset.id !== "default" ? [preset] : []; // If default preset, then remove it

          await UserEntity.save(userData);
          this.sendSuccess("Ваш профиль успешно обновлен! 🎉", interaction);
          return;
      }

      if (!preset) {
        return;
      }

      int.update({
        content: CreatePreviewPresetText(paginationHelper),
        embeds: [ParsePresetTokens(tokens, preset)],
      });
    });
  }
}
