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
import { isValidJson } from "@utils/json-validator.util";

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
      sub
        .setName(ProfileCommandSubCommandsTypes.INFO)
        .setDescription("Overall info on JSON etc.")
    ),
})
export class ProfilePresetsCommand extends BaseCommand<CmdType.SLASH_COMMAND> {
  async execute(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    try {
      const subCommandName = arg.options.getSubcommand(true);
      await arg.deferReply({ ephemeral: true });
      const { CREATE, UPDATE, DELETE, LIST, INFO } =
        ProfileCommandSubCommandsTypes;

      switch (subCommandName) {
        case CREATE:
          return this.createPreset(arg);
        case UPDATE:
          return this.updatePreset(arg);
        case DELETE:
          return this.deletePreset(arg);
        case LIST:
          return this.listPresets(arg);
        case INFO:
          return this.infoPreset(arg);
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
    if (!isValidJson(json))
      return await this.sendError("JSON you provided is not valid", arg);

    const parsedJson = JSON.parse(json);

    // TODO: Add more checks for other fields (should create a helper for that)
    // src: https://discordjs.guide/popular-topics/embeds.html#embed-limits
    if (!parsedJson.title || !parsedJson.description || !parsedJson.fields) {
      return this.sendError(
        "JSON you provided is not valid. It should contain title or description or fields",
        arg
      );
    }

    // Normalize JSON for storing in db (remove spaces etc.)
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

    return this.sendSuccess("New profile preset created!", arg);
  }

  public async updatePreset(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const id = arg.options.getString("id", true);
    const json = arg.options.getString("json", true);

    if (!id.match(/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/))
      return this.sendError("Invalid ID", arg);

    const foundPreset = await ProfilePresetEntity.findOne({
      where: {
        id,
      },
    });

    if (!foundPreset)
      return this.sendError("Can't find preset by ID you provide", arg);

    if (!isValidJson(json))
      return this.sendError("JSON you provided is not valid", arg);

    // Normalize JSON for storing in db (remove spaces etc.)
    foundPreset.json = JSON.stringify(JSON.parse(json));
    await foundPreset.save();

    return this.sendSuccess("Preset updated!", arg);
  }

  public async deletePreset(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const id = arg.options.getString("id", true);

    if (!id.match(/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/))
      return this.sendError("Invalid ID", arg);

    const foundPreset = await ProfilePresetEntity.findOne({
      where: {
        id,
      },
    });

    if (!foundPreset)
      return this.sendError("Can't find preset by ID you provide", arg);

    await foundPreset.remove();

    return this.sendSuccess("Preset deleted!", arg);
  }

  public async listPresets(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const presets = await ProfilePresetEntity.find();

    if (!presets.length)
      return this.sendError(
        `Unfortunatelly, we doesn't have any presets in the database`,
        arg
      );

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
      time: 5 * 1000 * 60000, // 5 minutes
    });

    if (!componentCollector)
      return this.sendError("Can't create component collector :(", arg);

    await arg.editReply({
      content: this.createContent(firstPreset, paginationHelper),
      embeds: [this.createEmbedFromJson(firstPreset)],
      components: [actionRow],
    });

    return componentCollector.on("collect", (int) => {
      switch (int.customId) {
        case NavigationButtons.TO_LEFT:
        case NavigationButtons.TO_RIGHT:
          const preset = {
            [NavigationButtons.TO_LEFT]: () =>
              paginationHelper.prevPage().createPage()[0],
            [NavigationButtons.TO_RIGHT]: () =>
              paginationHelper.nextPage().createPage()[0],
          };

          const getPreset = preset[int.customId]();
          int.update({
            content: this.createContent(getPreset, paginationHelper),
            embeds: [this.createEmbedFromJson(getPreset)],
          });
          break;
        case NavigationButtons.TO_STOP:
          componentCollector.stop();
          arg.deleteReply();
          break;
      }
    });
  }

  public async infoPreset(arg: CmdArg<CmdType.SLASH_COMMAND>) {
    const emptyField = {
      name: " ",
      value: " ",
    };

    const embed = new EmbedBuilder()
      .setTitle("📂 Информация о пресетах")
      .setDescription(
        "Ниже указаны FAQ по пресетам. Если у вас есть дополнительные вопросы, обратитесь к администратору."
      )
      .addFields([
        {
          name: "Что такое пресеты?",
          value:
            "Пресеты - это предустановленные шаблоны для профиля, которые можно использовать для быстрого изменения внешнего вида профиля.",
        },
        emptyField,
        {
          name: "Как создать пресет?",
          value:
            "Используйте сайт для геренации embed-объекта, например [Discord Embed Creator](https://embed.dan.onl/), и эскортируйте JSON-объект в команду.\n " +
            '```/profile-preset create json:"{"title":"My Profile","description":"Hello, world!"}"```',
        },
        emptyField,
        {
          name: "Как получить список пресетов?",
          value:
            "С помощью команды `/profile-preset list` вы можете получить список всех пресетов в базе данных и их ID.",
        },
        emptyField,
        {
          name: "Как обновить пресет?",
          value:
            "Команда `/profile-preset update id:uuid json:object` поможет вам обновить пресет по его ID.",
        },
        emptyField,
        {
          name: "Как удалить пресет?",
          value:
            "Команда `/profile-preset delete id:uuid` удалит пресет, если он существует.",
        },
      ])
      .setImage("https://i.imgur.com/Ut7zM46.png");

    return arg.editReply({ embeds: [embed] });
  }

  public createEmbedFromJson(preset: ProfilePresetEntity) {
    var embedBuilder = new EmbedBuilder(JSON.parse(preset.json));
    // Use .setColor function to convert color to number if it's a string
    if (embedBuilder.data.color) embedBuilder.setColor(embedBuilder.data.color);

    return embedBuilder;
  }

  public createContent(
    preset: ProfilePresetEntity,
    paginationHelper: PaginationHelper<ProfilePresetEntity>
  ) {
    return (
      `### 📃 Страница: [${paginationHelper.page} | ${paginationHelper.totalPages}]\n` +
      `ID в бд: \`\`${preset.id}\`\`\n` +
      `Последний редактор: <@${preset.updated_by}>\n` +
      `Создан: <t:${Math.floor(preset.created_at.getTime() / 1000)}:R>\n` +
      `Обновлён: <t:${Math.floor(preset.created_at.getTime() / 1000)}:R>\n`
    );
  }
}
