import { BaseCommand } from "@abstracts/command/command.abstract";
import { CmdArg, CmdType } from "@abstracts/command/command.types";
import { ProfileCommandSubCommandsTypes } from "@app/common/types/commands.types";
import { logger } from "@app/core/logger/logger-client";
import { SlashCommand } from "@decorators/commands.decorator";
import { ProfilePresetEntity } from "@entities/user/profile-preset.entity";
import {
  NavigationButtons,
  getNavigationSetup,
} from "@helpers/navigation.helper";
import PaginationHelper from "@helpers/pagination.helper";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

@SlashCommand({
  name: "profile-preset",
  description: "Command for creating/editing/deleting profile presets",
  data: new SlashCommandBuilder()
    .addSubcommand((sub) =>
      sub
        .setName(ProfileCommandSubCommandsTypes.CREATE)
        .setDescription("create preset")
        .addStringOption((opt) =>
          opt
            .setName("json")
            .setDescription(
              "JSON representation of the embed. You can search for it on embed generators sites"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName(ProfileCommandSubCommandsTypes.UPDATE)
        .setDescription("update preset")
        .addStringOption((opt) =>
          opt.setName("id").setDescription("id of the preset").setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("json")
            .setDescription("stringified JSON representation of the embed")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName(ProfileCommandSubCommandsTypes.DELETE)
        .setDescription("delete preset")
        .addStringOption((opt) =>
          opt.setName("id").setDescription("id of the preset").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName(ProfileCommandSubCommandsTypes.LIST)
        .setDescription("list all presets")
    )
    .addSubcommand((sub) =>
      sub.setName("info").setDescription("overoll info on JSON etc.")
    ),
})
export class ProfilePresetsCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  async execute(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    try {
      const subCommand = arg.options.getSubcommand(true);

      await arg.deferReply({ ephemeral: true });

      switch (subCommand) {
        case ProfileCommandSubCommandsTypes.CREATE:
          await this.createPreset(arg);
          break;
        case ProfileCommandSubCommandsTypes.UPDATE:
          await this.updatePreset(arg);
          break;
        case ProfileCommandSubCommandsTypes.DELETE:
          await this.deletePreset(arg);
          break;
        case ProfileCommandSubCommandsTypes.LIST:
          await this.listPresets(arg);
          break;
      }
    } catch (err) {
      logger.error(err);
    }
  }

  // ! We will reuse this method in another command when we will implement ability for generic users to buy custom profile presets.
  public async createPreset(
    arg: CmdArg<CmdType.SLASH_COMMAND>,
    isCustom = false
  ) {
    const json = arg.options.getString("json", true);

    const isValidJson = this.isValidJson(json);

    if (!isValidJson) {
      return arg.editReply({
        content: "JSON you provided is not valid embed object",
      });
    }

    // Converting to JSON and back again to reduce length size of the provided string.
    // You can provide something like this: {            author: { name: "richard" }              }
    // We don't wont to store it like this in db. Conversion below will reduce it length to
    // {"author":{"name":"richard"}} which lgt.
    const modifiedJson = JSON.stringify(JSON.parse(json));

    const data = {
      updated_by: arg.user.id,
      json: modifiedJson,
    };

    if (isCustom) {
      await ProfilePresetEntity.save({ user: { uid: arg.user.id }, ...data });
    } else {
      await ProfilePresetEntity.save({ ...data });
    }

    arg.editReply({ content: "New profile preset created!" });
  }

  public async updatePreset(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const id = arg.options.getString("id", true);
    const json = arg.options.getString("json", true);

    const foundPreset = await ProfilePresetEntity.findOne({
      where: {
        id,
      },
    });

    if (!foundPreset) {
      return arg.editReply({
        content: "Can't find preset by ID you provide",
      });
    }

    const isValidJson = this.isValidJson(json);

    if (!isValidJson) {
      return arg.editReply({
        content: "JSON you provided is not valid",
      });
    }

    const modifiedJson = JSON.stringify(JSON.parse(json));

    foundPreset.json = modifiedJson;

    await foundPreset.save();

    arg.editReply({
      content: "Preset updated!",
    });
  }

  public async deletePreset(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const id = arg.options.getString("id", true);

    const foundPreset = await ProfilePresetEntity.findOne({
      where: {
        id,
      },
    });

    if (!foundPreset) {
      return arg.editReply({ content: "Can't find preset by provided ID" });
    }

    await foundPreset.remove();

    arg.editReply({ content: "Preset deleted!" });
  }

  public async listPresets(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const presets = await ProfilePresetEntity.find();

    if (!presets.length) return arg.editReply({ content: "Found 0 presets" });

    const { list } = getNavigationSetup();
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(list);
    const paginationHelper = new PaginationHelper(presets, {
      elementsOnPage: 1,
    });

    const [firstPreset] = paginationHelper.createPage();

    const componentCollector = arg.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (int) =>
        int.user.id === arg.user.id && int.message.interaction?.id === arg.id,
      time: 5 * 1000 * 60000,
    });

    if (!componentCollector) {
      return arg.editReply({ content: "Can't create component collector :(" });
    }

    await arg.editReply({
      content: this.createContent(paginationHelper, firstPreset),
      embeds: [this.createEmbedFromJson(firstPreset)],
      components: [actionRow],
    });

    componentCollector?.on("collect", (int) => {
      switch (int.customId) {
        case NavigationButtons.TO_LEFT:
          const [prevPreset] = paginationHelper.prevPage().createPage();

          int.update({
            content: this.createContent(paginationHelper, prevPreset),
            embeds: [this.createEmbedFromJson(prevPreset)],
          });
          break;
        case NavigationButtons.TO_RIGHT:
          const [nextPreset] = paginationHelper.nextPage().createPage();

          int.update({
            content: this.createContent(paginationHelper, nextPreset),
            embeds: [this.createEmbedFromJson(nextPreset)],
          });
          break;
        case NavigationButtons.TO_STOP:
          componentCollector.stop();
          arg.deleteReply();
          break;
      }
    });
  }

  public isValidJson(str: string) {
    try {
      const parsedJson = JSON.parse(str);
      const embed = new EmbedBuilder(parsedJson);

      return true;
    } catch (err) {
      return false;
    }
  }

  public createEmbedFromJson(preset: ProfilePresetEntity) {
    const embedBuilder = new EmbedBuilder(JSON.parse(preset.json));

    // ! Need to do this because API angry about hex colors. Idk why xD
    if (embedBuilder.data.color) {
      embedBuilder.setColor(embedBuilder.data.color);
    }

    return embedBuilder;
  }

  public createContent(
    paginationHelper: PaginationHelper<ProfilePresetEntity>,
    preset: ProfilePresetEntity
  ) {
    return (
      `Страница: ${paginationHelper.page} | ${paginationHelper.totalPages}\n` +
      `Последний редактор: <@${preset.updated_by}>\n` +
      `Создан: ${preset.created_at.toLocaleString()}\n` +
      `Обновлён: ${preset.updated_at.toLocaleString()}\n` +
      `ID в бд: ${preset.id}`
    );
  }
}
