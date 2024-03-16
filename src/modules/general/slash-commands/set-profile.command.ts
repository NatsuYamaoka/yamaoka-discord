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
import { ParsePresetTokens } from "@utils/embed-parser.util";
import { userService } from "@app/services/user.service";

const TO_PROCEED = "to-proceed-button";

@SlashCommand({
  name: "set-profile",
  description: "Установить пресет профиля",
})
export class SetProfileCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  async execute(interaction: CmdArg<CmdType.SLASH_COMMAND>) {
    await interaction.deferReply({ ephemeral: true });
    const { sendError, sendSuccess } = this.getMethods(interaction);

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
      return sendError(
        "У вас нет пресетов для профиля, обратитесь к администратору сервера" // Note: This is a temporary solution, until the shop system is released
      );
    }

    // Note: This is a temporary solution, until the shop system is released
    const profile_presets = await ProfilePresetEntity.find();

    // Creating pseudo preset list, to not mess with the original data
    const presets = [
      {
        id: "default",
        json: JSON.stringify(defaultTemplate),
      } as ProfilePresetEntity,
      //...userData.profile_presets, // Note: Uncomment this on release of shop system
      ...profile_presets,
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
        time: 5 * 1000 * 60000, // 5 minutes
      });

    const { tokens } = GatherProfileTokens(
      userData,
      interaction.member as GuildMember,
      this.client.voiceManager
    );

    await interaction.editReply({
      content: this.createContent(paginationHelper),
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
          sendSuccess("Ваш профиль успешно обновлен! 🎉");
          return;
      }

      if (!preset) {
        return;
      }

      int.update({
        content: this.createContent(paginationHelper),
        embeds: [ParsePresetTokens(tokens, preset)],
      });
    });
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
